import { IsChannelDeep } from '../gosling.schema.guards';
import { HiGlassModel } from '../higlass-model';
import { SUPPORTED_CHANNELS } from '../mark';
import { resolveSuperposedTracks } from './overlay';

/**
 *
 */
export function getLinkingInfo(hgModel: HiGlassModel) {
    const linkingInfo: {
        layout: 'circular' | 'linear';
        viewId: string;
        linkId: string;
        isBrush: boolean;
        style: any;
    }[] = [];

    hgModel.spec().views.forEach(v => {
        const viewId = v.uid;
        const spec = /* TODO: */ (v.tracks as any).center?.[0]?.contents?.[0]?.options?.spec;

        if (!viewId || !spec) return;

        const resolved = resolveSuperposedTracks(spec);

        resolved.forEach(spec => {
            SUPPORTED_CHANNELS.forEach(cKey => {
                const channel = spec[cKey];

                if (IsChannelDeep(channel) && channel.linkingId) {
                    linkingInfo.push({
                        layout: spec.layout === 'circular' ? 'circular' : 'linear',
                        viewId,
                        linkId: channel.linkingId,
                        isBrush: spec.mark === 'brush',
                        style: {
                            color: (spec as any).color?.value,
                            stroke: (spec as any).stroke?.value,
                            strokeWidth: (spec as any).strokeWidth?.value,
                            opacity: (spec as any).opacity?.value,
                            startAngle: spec._startAngle,
                            endAngle: spec._endAngle,
                            innerRadius: spec._innerRadius,
                            outerRadius: spec._outerRadius
                        }
                    });
                    return;
                }
            });
        });
    });
    return linkingInfo;
}

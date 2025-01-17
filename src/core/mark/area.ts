import { TooltipData, TOOLTIP_MOUSEOVER_MARGIN as G } from '../../gosling-tooltip';
import { GoslingTrackModel } from '../gosling-track-model';
import { Channel, Datum } from '../gosling.schema';
import { min as d3min, max as d3max, group } from 'd3-array';
import { IsStackedMark, getValueUsingChannel } from '../gosling.schema.guards';
import { cartesianToPolar } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';

// TODO: fill the white gap betwee tiles.
/**
 * Draw area marks
 */
export function drawArea(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* data */
    const data = tm.data();

    /* track size */
    const [trackWidth, trackHeight] = trackInfo.dimensions;
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX } = trackInfo.getTilePosAndDimensions(tile.gos.zoomLevel, tile.gos.tilePos, tileSize);

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220; // TODO: should default values be filled already
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const trackCenterX = trackWidth / 2.0;
    const trackCenterY = trackHeight / 2.0;

    /* genomic scale */
    const xScale = tm.getChannelScale('x');

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* color separation */
    const colorCategories = (tm.getChannelDomainArray('color') as string[]) ?? ['___SINGLE_COLOR___'];

    /* constant values */
    // we do not support encoding opacity, strokeWidth, and stroke for area marks
    const constantOpacity = tm.encodedPIXIProperty('opacity');
    const constantStrokeWidth = tm.encodedPIXIProperty('strokeWidth');
    const constantStroke = tm.encodedPIXIProperty('stroke');

    /* render */
    const graphics = tile.graphics;
    if (IsStackedMark(spec)) {
        // TODO: many parts in this scope are identical as the below `else` statement, so encaptulate this?

        const genomicChannel = tm.getGenomicChannel();
        if (!genomicChannel || !genomicChannel.field) {
            console.warn('Genomic field is not provided in the specification');
            return;
        }
        const pivotedData = group(data, d => d[genomicChannel.field as string]);
        const genomicPosCategories = [...pivotedData.keys()]; // TODO: make sure to be sorted from left to right or top to bottom

        // stroke
        graphics.lineStyle(
            constantStrokeWidth,
            colorToHex(constantStroke),
            constantOpacity,
            1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );

        const prevYEndByGPos: { [k: string]: number } = {};

        // TODO: we can have a multiple rows when color and row are mapped with different fields
        // are marks are drawn for each color
        colorCategories.forEach(colorCategory => {
            // we have two sets of points since we need to draw the bottom line as well
            const areaPointsTop: number[][] = [];
            const areaPointsBottom: number[][] = [];

            // TODO: users may want to align rows by values
            genomicPosCategories.forEach((genomicPosCategory, i, array) => {
                pivotedData
                    .get(genomicPosCategory)
                    ?.filter(d => getValueUsingChannel(d, spec.color as Channel) === colorCategory)
                    ?.forEach(d => {
                        const xValue = +genomicPosCategory;

                        const cx = xScale(xValue);
                        const cy = d3max([tm.encodedPIXIProperty('y', d), 0]); // make should not to overflow

                        if (circular) {
                            if (i === 0) {
                                // start position of the polygon
                                const r = trackOuterRadius - (rowHeight / trackHeight) * trackRingSize;
                                const pos = cartesianToPolar(
                                    cx,
                                    trackWidth,
                                    r,
                                    trackCenterX,
                                    trackCenterY,
                                    startAngle,
                                    endAngle
                                );
                                areaPointsTop.push([pos.x, pos.y]);
                                areaPointsBottom.push([pos.x, pos.y]);
                            }

                            if (typeof prevYEndByGPos[genomicPosCategory] === 'undefined') {
                                prevYEndByGPos[genomicPosCategory] = 0;
                            }

                            const rTop =
                                trackOuterRadius -
                                ((rowHeight - cy - prevYEndByGPos[genomicPosCategory]) / trackHeight) * trackRingSize;
                            const posTop = cartesianToPolar(
                                cx,
                                trackWidth,
                                rTop,
                                trackCenterX,
                                trackCenterY,
                                startAngle,
                                endAngle
                            );
                            areaPointsTop.push([posTop.x, posTop.y]);

                            const rBot =
                                trackOuterRadius -
                                ((rowHeight - prevYEndByGPos[genomicPosCategory]) / trackHeight) * trackRingSize;
                            const posBot = cartesianToPolar(
                                cx,
                                trackWidth,
                                rBot,
                                trackCenterX,
                                trackCenterY,
                                startAngle,
                                endAngle
                            );
                            areaPointsBottom.push([posBot.x, posBot.y]);

                            if (i === array.length - 1) {
                                // end position of the polygon
                                const r = trackOuterRadius - (rowHeight / trackHeight) * trackRingSize;
                                const pos = cartesianToPolar(
                                    cx,
                                    trackWidth,
                                    r,
                                    trackCenterX,
                                    trackCenterY,
                                    startAngle,
                                    endAngle
                                );
                                areaPointsTop.push([pos.x, pos.y]);
                                areaPointsBottom.push([pos.x, pos.y]);
                            }
                        } else {
                            if (i === 0) {
                                // start position of the polygon
                                areaPointsTop.push([cx, rowHeight]); // TODO: confirm if this is correct
                                areaPointsBottom.push([cx, rowHeight]);
                            }

                            if (typeof prevYEndByGPos[genomicPosCategory] === 'undefined') {
                                prevYEndByGPos[genomicPosCategory] = 0;
                            }

                            areaPointsTop.push([cx, rowHeight - cy - prevYEndByGPos[genomicPosCategory]]);
                            areaPointsBottom.push([cx, rowHeight - prevYEndByGPos[genomicPosCategory]]);

                            if (i === array.length - 1) {
                                // end position of the polygon
                                areaPointsTop.push([cx, rowHeight]);
                                areaPointsBottom.push([cx, rowHeight]);
                            }

                            /* Tooltip data */
                            if (spec.tooltip) {
                                const ys = rowHeight - cy - prevYEndByGPos[genomicPosCategory];
                                const ye = rowHeight - prevYEndByGPos[genomicPosCategory];
                                trackInfo.tooltips.push({
                                    datum: d,
                                    isMouseOver: (x: number, y: number) =>
                                        cx - G < x && x < cx + G && ys - G < y && y < ye + G,
                                    markInfo: { x: cx, y: ys, width: G, height: cy, type: 'area' }
                                } as TooltipData);
                            }
                        }

                        prevYEndByGPos[genomicPosCategory] += cy;
                    });
            });
            const color = tm.encodedValue('color', colorCategory);
            graphics.beginFill(colorToHex(color), constantOpacity);
            graphics.drawPolygon([
                ...areaPointsTop.reduce((a, b) => a.concat(b)),
                ...areaPointsBottom.reverse().reduce((a, b) => a.concat(b))
            ]);
            graphics.endFill();
        });
    } else {
        rowCategories.forEach(rowCategory => {
            const rowPosition = tm.encodedValue('row', rowCategory);

            // stroke
            graphics.lineStyle(
                constantStrokeWidth,
                colorToHex(constantStroke),
                constantOpacity,
                0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            // area marks are drawn for each color
            colorCategories.forEach(colorCategory => {
                const baselinePoints: number[][] = [];
                const areaPoints: number[] = [];
                const baselineR = trackOuterRadius - ((rowPosition + rowHeight) / trackHeight) * trackRingSize;

                data.filter(
                    d =>
                        (typeof getValueUsingChannel(d, spec.row as Channel) === 'undefined' ||
                            (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory) &&
                        (typeof getValueUsingChannel(d, spec.color as Channel) === 'undefined' ||
                            (getValueUsingChannel(d, spec.color as Channel) as string) === colorCategory)
                )
                    .sort(
                        // should sort properly before visualizing it so that the path is correctly drawn
                        (a: Datum, b: Datum) => tm.encodedPIXIProperty('x', a) - tm.encodedPIXIProperty('x', b)
                    )
                    .forEach((d, i, array) => {
                        // TODO: this should be included in the `encodedValue` functions
                        // make should not to overflow when using use-defined `domain`
                        const cy = d3min([d3max([tm.encodedPIXIProperty('y', d), 0]), rowHeight]);
                        const cx = tm.encodedPIXIProperty('x', d);

                        if (circular) {
                            // we need to prepare the points for drawing baseline
                            const baselinePos = cartesianToPolar(
                                cx,
                                trackWidth,
                                baselineR,
                                trackCenterX,
                                trackCenterY,
                                startAngle,
                                endAngle
                            );
                            baselinePoints.push([baselinePos.x, baselinePos.y]);

                            if (i === 0) {
                                // start position of the polygon
                                areaPoints.push(baselinePos.x, baselinePos.y);
                            }

                            const r = trackOuterRadius - ((rowPosition + rowHeight - cy) / trackHeight) * trackRingSize;
                            const pos = cartesianToPolar(
                                cx,
                                trackWidth,
                                r,
                                trackCenterX,
                                trackCenterY,
                                startAngle,
                                endAngle
                            );
                            areaPoints.push(pos.x, pos.y);

                            if (i === array.length - 1) {
                                // close the polygon with a point at the start
                                const startR =
                                    trackOuterRadius - ((rowPosition + rowHeight) / trackHeight) * trackRingSize;
                                const curPos = cartesianToPolar(
                                    cx,
                                    trackWidth,
                                    startR,
                                    trackCenterX,
                                    trackCenterY,
                                    startAngle,
                                    endAngle
                                );

                                areaPoints.push(curPos.x, curPos.y);
                            }
                        } else {
                            if (i === 0) {
                                // start position of the polygon
                                areaPoints.push(cx, rowPosition + rowHeight);
                            }

                            areaPoints.push(cx, rowPosition + rowHeight - cy);

                            if (i === array.length - 1) {
                                // close the polygon with a point at the start
                                const startX = xScale(tileX);
                                areaPoints.push(cx, rowPosition + rowHeight);
                                areaPoints.push(startX, rowPosition + rowHeight);
                            }

                            /* Tooltip data */
                            if (spec.tooltip) {
                                trackInfo.tooltips.push({
                                    datum: d,
                                    isMouseOver: (x: number, y: number) =>
                                        cx - G < x &&
                                        x < cx + G &&
                                        rowPosition - G < y &&
                                        y < rowPosition + rowHeight + G,
                                    markInfo: { x: cx, y: cy, width: G, height: cy, type: 'area' }
                                } as TooltipData);
                            }
                        }
                    });

                if (circular && baselinePoints.length !== 0) {
                    // Add baseline points
                    areaPoints.push(...baselinePoints.reverse().reduce((a, b) => a.concat(b)));
                }

                const color = tm.encodedValue('color', colorCategory);
                graphics.beginFill(colorToHex(color), constantOpacity);
                graphics.drawPolygon(areaPoints);
                graphics.endFill();
            });
        });
    }
}

import { GoslingSpec } from 'gosling.js';
import { EX_SPEC_GENE_TRANSCRIPT } from './gene-transcript';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_MARK_DISPLACEMENT: GoslingSpec = {
    title: 'Mark Displacement',
    subtitle: 'Reposition marks to address visual overlaps using `displacement` options',
    // static: true,
    spacing: 1,
    centerRadius: 0.8,
    xDomain: { chromosome: '17', interval: [43080000, 43120000] },
    views: [
        EX_SPEC_GENE_TRANSCRIPT,
        {
            xDomain: { chromosome: '2', interval: [126800000, 127700000] },
            tracks: [
                {
                    alignment: 'overlay',
                    title: 'Likely Benign',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=clinvar-beddb',
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [
                            { index: 7, name: 'significance', type: 'nominal' },
                            { type: 'nominal', index: 3, name: '3' },
                            { type: 'nominal', index: 4, name: '4' }
                            // { type: 'nominal', index: 5, name: '5' },
                            // { type: 'nominal', index: 6, name: '6' },
                            // { type: 'nominal', index: 7, name: '7' },
                            // { type: 'nominal', index: 8, name: '8' },
                            // { type: 'nominal', index: 9, name: '9' },
                            // { type: 'nominal', index: 10, name: '10' },
                            // { type: 'nominal', index: 11, name: '11' },
                            // { type: 'nominal', index: 12, name: '12' },
                            // { type: 'nominal', index: 13, name: '13' },
                        ]
                    },
                    dataTransform: [
                        { type: 'filter', field: 'significance', oneOf: ['Likely_benign'] },
                        {
                            type: 'displace',
                            boundingBox: { startField: 'start', endField: 'end', padding: 5 },
                            method: 'spread',
                            newField: 'a'
                        }
                    ],
                    tracks: [
                        {
                            mark: 'point',
                            encoding: {
                                size: { value: 4 },
                                color: { value: '#029F73' },
                                stroke: { value: 'black' },
                                strokeWidth: { value: 1 }
                            }
                        },
                        {
                            mark: 'text',
                            encoding: {
                                color: { field: '3', type: 'nominal', domain: ['A', 'T', 'G', 'C'], legend: true },
                                text: { field: '3', type: 'nominal' },
                                y: { value: 48 }
                            }
                        },
                        {
                            mark: 'text',
                            encoding: {
                                color: { field: '4', type: 'nominal', domain: ['A', 'T', 'G', 'C'] },
                                text: { field: '4', type: 'nominal' },
                                y: { value: 18 }
                            }
                        },
                        {
                            mark: 'text',
                            encoding: {
                                color: { value: 'gray' },
                                text: { value: '↓' },
                                y: { value: 33 }
                            }
                        }
                    ],
                    encoding: {
                        x: { startField: 'aStart', endField: 'aEnd', type: 'genomic' },
                        y: { value: 5 },
                        opacity: { value: 0.8 }
                    },
                    style: { inlineLegend: true },
                    width: 700,
                    height: 60
                },
                {
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=clinvar-beddb',
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
                    },
                    dataTransform: [
                        { type: 'filter', field: 'significance', oneOf: ['Likely_benign'] },
                        {
                            type: 'displace',
                            boundingBox: { startField: 'start', endField: 'end', padding: 5 },
                            method: 'spread',
                            newField: 'a'
                        }
                    ],
                    mark: 'betweenLink',
                    encoding: {
                        x: { startField: 'aStart', endField: 'start', type: 'genomic' },
                        color: { value: '#029F73' },
                        stroke: { value: 'lightgrey' },
                        strokeWidth: { value: 0.5 },
                        opacity: { value: 0.8 }
                    },
                    width: 700,
                    height: 60
                },
                {
                    alignment: 'overlay',
                    tracks: [
                        {
                            data: {
                                url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=clinvar-beddb',
                                type: 'beddb',
                                genomicFields: [
                                    { index: 1, name: 'start' },
                                    { index: 2, name: 'end' }
                                ],
                                valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
                            },
                            dataTransform: [{ type: 'filter', field: 'significance', oneOf: ['Likely_benign'] }],
                            mark: 'rect',
                            encoding: {
                                color: { value: 'lightgray' },
                                stroke: { value: 'lightgray' },
                                strokeWidth: { value: 0.5 },
                                x: { startField: 'start', endField: 'end', type: 'genomic' },
                                opacity: { value: 0.8 }
                            }
                        },
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.geneAnnotation,
                                type: 'beddb',
                                genomicFields: [
                                    { index: 1, name: 'start' },
                                    { index: 2, name: 'end' }
                                ],
                                valueFields: [
                                    { index: 5, name: 'strand', type: 'nominal' },
                                    { index: 3, name: 'name', type: 'nominal' }
                                ],
                                exonIntervalFields: [
                                    { index: 12, name: 'start' },
                                    { index: 13, name: 'end' }
                                ]
                            },
                            encoding: {
                                row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                                color: {
                                    field: 'strand',
                                    type: 'nominal',
                                    domain: ['+', '-'],
                                    range: ['#7585FF', '#FF8A85']
                                },
                                opacity: { value: 0.8 },
                                x: {
                                    field: 'end',
                                    type: 'genomic',
                                    axis: 'none'
                                },
                                size: { value: 15 }
                            },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    target: 'mark'
                                }
                            ],
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight'
                        },
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.geneAnnotation,
                                type: 'beddb',
                                genomicFields: [
                                    { index: 1, name: 'start' },
                                    { index: 2, name: 'end' }
                                ],
                                valueFields: [
                                    { index: 5, name: 'strand', type: 'nominal' },
                                    { index: 3, name: 'name', type: 'nominal' }
                                ],
                                exonIntervalFields: [
                                    { index: 12, name: 'start' },
                                    { index: 13, name: 'end' }
                                ]
                            },
                            encoding: {
                                row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                                color: {
                                    field: 'strand',
                                    type: 'nominal',
                                    domain: ['+', '-'],
                                    range: ['#7585FF', '#FF8A85']
                                },
                                opacity: { value: 0.8 },
                                text: { field: 'name', type: 'nominal' },
                                x: { startField: 'start', endField: 'end', type: 'genomic' }
                            },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    target: 'mark'
                                }
                            ],
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            style: { dy: -15 }
                        },
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.geneAnnotation,
                                type: 'beddb',
                                genomicFields: [
                                    { index: 1, name: 'start' },
                                    { index: 2, name: 'end' }
                                ],
                                valueFields: [
                                    { index: 5, name: 'strand', type: 'nominal' },
                                    { index: 3, name: 'name', type: 'nominal' }
                                ],
                                exonIntervalFields: [
                                    { index: 12, name: 'start' },
                                    { index: 13, name: 'end' }
                                ]
                            },
                            encoding: {
                                row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                                color: {
                                    field: 'strand',
                                    type: 'nominal',
                                    domain: ['+', '-'],
                                    range: ['#7585FF', '#FF8A85']
                                },
                                opacity: { value: 0.8 },
                                x: { field: 'start', type: 'genomic' },
                                size: { value: 15 }
                            },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    target: 'mark'
                                }
                            ],
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            style: { align: 'right' }
                        },
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.geneAnnotation,
                                type: 'beddb',
                                genomicFields: [
                                    { index: 1, name: 'start' },
                                    { index: 2, name: 'end' }
                                ],
                                valueFields: [
                                    { index: 5, name: 'strand', type: 'nominal' },
                                    { index: 3, name: 'name', type: 'nominal' }
                                ],
                                exonIntervalFields: [
                                    { index: 12, name: 'start' },
                                    { index: 13, name: 'end' }
                                ]
                            },
                            encoding: {
                                row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                                color: {
                                    field: 'strand',
                                    type: 'nominal',
                                    domain: ['+', '-'],
                                    range: ['#7585FF', '#FF8A85']
                                },
                                x: {
                                    startField: 'start',
                                    endField: 'end',
                                    type: 'genomic'
                                },
                                size: { value: 15 },
                                opacity: { value: 0.8 }
                            },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    target: 'mark'
                                }
                            ],
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect'
                        },
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.geneAnnotation,
                                type: 'beddb',
                                genomicFields: [
                                    { index: 1, name: 'start' },
                                    { index: 2, name: 'end' }
                                ],
                                valueFields: [
                                    { index: 5, name: 'strand', type: 'nominal' },
                                    { index: 3, name: 'name', type: 'nominal' }
                                ],
                                exonIntervalFields: [
                                    { index: 12, name: 'start' },
                                    { index: 13, name: 'end' }
                                ]
                            },
                            encoding: {
                                row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                                opacity: { value: 0.8 },
                                color: {
                                    field: 'strand',
                                    type: 'nominal',
                                    domain: ['+', '-'],
                                    range: ['#7585FF', '#FF8A85']
                                },
                                x: {
                                    startField: 'start',
                                    endField: 'end',
                                    type: 'genomic'
                                },
                                strokeWidth: { value: 3 }
                            },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    target: 'mark'
                                }
                            ],
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'rule',
                            style: {
                                linePattern: { type: 'triangleRight', size: 5 }
                            }
                        },
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.geneAnnotation,
                                type: 'beddb',
                                genomicFields: [
                                    { index: 1, name: 'start' },
                                    { index: 2, name: 'end' }
                                ],
                                valueFields: [
                                    { index: 5, name: 'strand', type: 'nominal' },
                                    { index: 3, name: 'name', type: 'nominal' }
                                ],
                                exonIntervalFields: [
                                    { index: 12, name: 'start' },
                                    { index: 13, name: 'end' }
                                ]
                            },
                            encoding: {
                                row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                                color: {
                                    field: 'strand',
                                    type: 'nominal',
                                    domain: ['+', '-'],
                                    range: ['#7585FF', '#FF8A85']
                                },
                                opacity: { value: 0.8 },
                                strokeWidth: { value: 3 },
                                x: {
                                    startField: 'start',
                                    endField: 'end',
                                    type: 'genomic'
                                }
                            },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    target: 'mark'
                                }
                            ],
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'rule',
                            style: {
                                linePattern: { type: 'triangleLeft', size: 5 }
                            }
                        }
                    ],
                    width: 700,
                    height: 100
                }
            ]
        },
        {
            tracks: [
                {
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=clinvar-beddb',
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
                    },
                    displacement: { type: 'pile', padding: 3.5 },
                    mark: 'point',
                    encoding: {
                        x: { startField: 'start', endField: 'end', type: 'genomic' },
                        size: { value: 3 },
                        color: {
                            field: 'significance',
                            type: 'nominal',
                            domain: [
                                'Pathogenic',
                                'Pathogenic/Likely_pathogenic',
                                'Likely_pathogenic',
                                'Uncertain_significance',
                                'Likely_benign',
                                'Benign/Likely_benign',
                                'Benign'
                            ],
                            range: ['#CB3B8C', '#CB71A3', '#CB96B3', 'gray', '#029F73', '#5A9F8C', '#5A9F8C'],
                            legend: true
                        }
                    },
                    width: 700,
                    height: 260
                }
            ]
        }
    ],
    style: { outlineWidth: 0 }
};

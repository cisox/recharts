import React from 'react';
export declare const SCALE_TYPES: string[];
export declare const LEGEND_TYPES: string[];
export declare const TOOLTIP_TYPES: string[];
export declare const getDisplayName: (Comp: any) => any;
export declare const findAllByType: (children: React.ReactNode, type: string | string[]) => React.DetailedReactHTMLElement<any, HTMLElement>[];
export declare const findChildByType: (children: React.ReactNode[], type: string) => React.DetailedReactHTMLElement<any, HTMLElement>;
export declare const withoutType: (children: React.ReactNode, type: string) => React.ReactNode[];
export declare const validateWidthHeight: (el: any) => boolean;
export declare const filterSvgElements: (children: React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>[]) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>[];
export declare const isChildrenEqual: (nextChildren: React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>[], prevChildren: React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>[]) => boolean;
export declare const isSingleChildEqual: (nextChild: React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>, prevChild: React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>) => boolean;
export declare const renderByOrder: (children: React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>[], renderMap: any) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>[];
export declare const getReactEventByType: (e: any) => any;
export declare const parseChildIndex: (child: any, children: any[]) => number;

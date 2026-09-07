export interface CodePathItem {
    cond?: any;
    notCond?: any;
    tell?: any;
    stmt?: any;
    desc?: string;
}

export interface CodePath {
    path: CodePathItem[],
    jigsUp: boolean
}

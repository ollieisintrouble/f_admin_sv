import type { Page } from "$lib/types/types";

const bucketSize = 10;

export function CalcPages(array: any[]) {
    if (array.length === 0) return [];

    let result: Page[] = [];
    for (let i = 0; i < array.length; i += bucketSize) {
        const pageIndex = Math.floor(i / bucketSize);
        result.push({
            num: pageIndex + 1,
            items: array.slice(i, i + bucketSize),
        });
    }

    return result;
}
export function CalcVisiblePages(pages: Page[], currentPage: number) {
    const result = [];
    const pageCount = pages.length;

    if (pageCount === 0) return [];

    if (currentPage > 6 && currentPage < pageCount - 4) {
        for (let i = currentPage - 2; i < currentPage + 3; i++) {
            if (pages[i - 1]) result.push(pages[i - 1]);
        }
    } else if (currentPage > pageCount - 5) {
        for (let i = Math.max(1, pageCount - 4); i <= pageCount; i++) {
            if (pages[i - 1]) result.push(pages[i - 1]);
        }
    } else {
        for (let i = 1; i <= Math.min(5, pageCount); i++) {
            if (pages[i - 1]) result.push(pages[i - 1]);
        }
    }

    return result;
}

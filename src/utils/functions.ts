export function findById(list: any[], id: number | string) {
    return list.find(el => el.id === id);
}
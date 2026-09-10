export function distance(p1, p2) {
    const deltaX = p1.x - p2.x;
    const deltaY = p1.y - p2.y;

    return Math.sqrt(deltaX*deltaX + deltaY*deltaY);
}

export function lerp(t, p1, p2) {
    let newP = {x: 0, y: 0};
    newP.x = p1.x + t * (p2.x - p1.x); // Adderar en "t-djedel" på p1
    newP.y = p1.y + t * (p2.y - p1.y);
    return newP;
}
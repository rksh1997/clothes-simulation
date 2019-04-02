class Spring {
  constructor(cloth, p1, p2, K) {
    this.p1 = p1;
    this.p2 = p2;
    this.K = K;
    this.restDistance = cloth.vertices[p1].distanceTo(cloth.vertices[p2])
  }
}

export default Spring;

import { Vector3 } from 'three';

class Spring {
	constructor(p1, p2, resetDistance) {
    this.p1 = p1;
    this.p2 = p2;
    this.resetDistance = resetDistance;
	}

  update() {
    const p1 = this.p1.position;
    const p2 = this.p2.position;

    const dist = Vector3.subVectors(p1, p2);

    dist.setLength(dist.getLength - this.resetDistance);

    const f = dist.multiplyScalar(STIFFNESS);
    this.p1.applyForce(f);
    // this.p2.applyForce(f.multiplyScalar(-1));
  }
}
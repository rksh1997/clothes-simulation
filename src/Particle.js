import {
  Vector3,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh
} from 'three';


class Particle extends Mesh {
  constructor(geometry, material, position, mass) {
    super(geometry, material);
    this.position.copy(position);
    this.previousPosition = position.clone();
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.mass = mass;
    this.invMass = 1 / mass;
    this.springs = []
  }

  preUpdate(dt) {
    const length = this.springs.length;
    for(let i = 0; i < length; i += 1) {
      const spring = this.springs[i];
      spring.update(dt);
    }
  }

  update(dt) {
    this.previousPosition = this.position.clone();
    this.position.add(this.velocity.multiplyScalar(dt));
    this.velocity.add(this.acceleration);
    this.acceleration.set(0, 0, 0);
  }

  applyGravity(gravity) {
    this.acceleration.add(gravity.multiplyScalar(this.invMass));
  }

  applyForce(force) {
    const tmp = new Vector3();
    this.acceleration.add(tmp.copy(force));
  }
}

export default Particle;

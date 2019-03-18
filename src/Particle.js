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
  }

  update(dt) {
    this.previousPosition = this.position.clone();
    this.position.add(this.velocity.multiplyScalar(dt));
    this.velocity.add(this.acceleration);
    this.acceleration.set(0, 0, 0);
  }

  applyGravity(gravity) {
    this.acceleration.add(gravity.multiplyScalar(this.invMassm));
  }

  applyForce(force) {
    const tmp = new Vector3();
    this.acceleration.add(tmp.copy(force));
  }
}

export default Particle;

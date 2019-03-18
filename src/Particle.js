import {
  Vector3
} from 'three';


class Particle {
  constructor(x, y, z, mass) {
    this.posistion = new Vector3(x, y, z);
    this.previousPosition = new Vector3(x, y, z);
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.mass = mass;
  }
}

export default Particle;

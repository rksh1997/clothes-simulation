import {
  Vector3,
  Geometry,
  Face3,
  Color
} from 'three';
import Particle from './Particle';

class Cloth extends Geometry {
  constructor(width, height) {
    super();
    // number of particles in width
    this.width = width;

    // number of particles in height
    this.height = height;

    this.MASS = 10;

    this.createParticles();
    this.createFaces();
  }

  createParticles() {
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        this.vertices.push(
          new Particle(
            i / this.width,
            j / this.height,
            0,
            this.MASS
          )
        )
      }
    }
  }

  createFaces() {
    const color = new Color(0xffff00);
    const normal = new Vector3(0, 0, 1);
    for (let i = 0; i < this.width - 1; i += 1) {
      for (let j = 0; j < this.height - 1; j += 1) {
        const p1 = i * this.width + j;
        const p2 = p1 + 1;
        const p3 = p1 + this.width;
        this.faces.push(new Face3(p1, p2, p3,));
      }
    }

    for (let i = this.width - 1; i > 0; i -= 1) {
      for (let j = this.height - 1; j > 0; j -= 1) {
        const p1 = i * this.width + j;
        const p2 = p1 - 1;
        const p3 = p1 - this.width;
        this.faces.push(new Face3(p1, p2, p3, normal, color, 0));
      }
    }
  }

  update(dt) {
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        this.particles[i * this.width + j].update(dt);
      }
    }
  }
}

export default Cloth;

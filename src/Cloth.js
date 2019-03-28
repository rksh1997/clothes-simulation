import {
  Vector3
} from 'three';
import Particle from './Particle';

class Cloth {
  constructor(width, height) {
    // number of particles in width
    this.width = width;

    // number of particles in height
    this.height = height;

    // distance between two particles
    this.padding = 10;

    // container for particles
    this.particles = [];

    this.MASS = 10;

    this.createParticles();
  }

  createParticles() {
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        this.particles.push(
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

  }

  update(dt) {
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        this.particles[i * this.width + j].update(dt);
      }
    }
  }

  draw(scene) {
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        this.particles[i * this.width + j].draw(scene);
      }
    }
  }
}

export default Cloth;

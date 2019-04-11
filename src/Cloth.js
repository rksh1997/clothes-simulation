import {
  Vector3,
  Geometry,
  Face3,
  Color
} from 'three';
import Spring from './Spring';

class Cloth extends Geometry {
  constructor(width, height) {
    super();
    // number of particles in width
    this.width = width;

    // number of particles in height
    this.height = height;

    this.MASS = 1;

    this.springs = [];
    this.forces = [];
    this.velocities = [];

    this.lastTimeWindAffected = 0;
    this.theta = 0;
    this.sign = 1;

    this.createParticles();
    this.createSprings()
    this.createFaces();

    document.body.addEventListener('mousedown', () => {
      this.sign *= -1;
    })
  }

  createParticles() {
    let size = 4
    let hsize = size / 2

    for (let j = 0; j < this.width; j++) {
      for (let i = 0; i < this.height; i++) {
        this.vertices.push(new Vector3(((i / (this.width - 1)) * 2.0 - 1.) * hsize, size + 1, ((j / (this.height - 1.0)) * size)))
        this.forces.push(new Vector3(0, 0, 0))
        this.velocities.push(new Vector3(0, 0, 0))
      }
    }
  }

  check(x, y) {
    return x >= 0 && y >= 0 && x < this.height && y < this.width
  }

  flatten(i, j) {
    return i * this.width + j
  }

  createSprings() {
    let dc = [1, 1, 1, -1, -1, -1, 0, 0]
    let dr = [1, -1, 0, 1, -1, 0, 1, -1]

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const p = this.flatten(i, j)
        for (let d = 0; d < 8; d++) {
          let ii = i + dr[d]
          let jj = j + dc[d]
          if (this.check(ii, jj)) {
            this.springs.push(new Spring(this, p, this.flatten(ii, jj), 1000))
          }
        }
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
        this.faces.push(new Face3(p1, p2, p3));
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

  computeForces() {
    for (let i in this.vertices) {
      this.forces[i].set(0, 0, 0)
      if (i != 0 && i != this.width - 1) {
        this.forces[i].add(new Vector3(0, -9.8, 0)) // gravity
      }

      if (i != 0 && i != this.width - 1) {
        if (Date.now() - this.lastTimeWindAffected > 10) {
          if (true || i >= (this.width-1) * (this.height-1) - 10)
          {
            this.forces[i].add(new Vector3(Math.abs(Math.sin(this.theta)) * this.sign * 7, 0, Math.abs(Math.cos(this.theta)) * this.sign * 7));
            this.theta += 0.001;
            if (i == (this.width-1) * (this.height-1))
              this.lastTimeWindAffected = Date.now();
          }
        }
      }

      this.forces[i].sub(this.velocities[i].clone().multiplyScalar(1.5)) // damping
    }

    let deltaP = new Vector3()
    let deltaV = new Vector3()

    for (let i in this.springs) {
      let idx1 = this.springs[i].p1
      let idx2 = this.springs[i].p2

      let p1 = this.vertices[idx1]
      let p2 = this.vertices[idx2]
      deltaP.subVectors(p1, p2)

      let v1 = this.velocities[idx1]
      let v2 = this.velocities[idx2]
      deltaV.subVectors(v1, v2)

      let dist = deltaP.length()

      let leftTerm = -this.springs[i].K * (dist - this.springs[i].restDistance) / 2
      let rightTerm = -0.5 * (deltaV.dot(deltaV) / dist)

      let springForce = (deltaP.normalize()).multiplyScalar(leftTerm + rightTerm)

      if (idx1 != this.width - 1 && idx1 != 0)
        this.forces[idx1].add(springForce);

      if (idx2 != this.width - 1 && idx2 != 0)
        this.forces[idx2].sub(springForce);
    }
  }

  update() {
    this.verticesNeedUpdate = true

    let dt = 1.0 / 60
    for (let i in this.vertices) {
      let prevVelocity = this.velocities[i]
      this.velocities[i].add(this.forces[i].clone().multiplyScalar(dt / this.MASS))
      this.vertices[i].add(prevVelocity.clone().multiplyScalar(dt))
      // if (this.vertices[i].y < 0) {
      //   this.vertices[i].y = 0;
      // }
    }
  }
}

export default Cloth;
import {
  Vector3,
  Geometry,
  Face3
} from 'three';
import Spring from './Spring';

class Cloth extends Geometry {
  constructor(width, height) {
    super();

    this.width = width;
    this.height = height;

    this.MASS = 1;

    this.DAMPING = 0.5

    this.springs = new Array();
    this.forces = new Array();
    this.velocities = new Array();

    // is vertex[i] pinned or not?
    this.pinned = new Int8Array(width * height);

    this.pin();
    this.createParticles();
    this.createSprings()
    this.createFaces();
  }

  pin() {
    // for (let i = 0; i < this.width; i++) {
    //   this.pinned[i + this.width * 0] = 1
    // }
    this.pinned[0] = 1
    this.pinned[this.width - 1] = 1
  }

  createParticles() {
    let size = 4
    let hsize = size / 2

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
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
    let dc1 = [1, -1, 0, 0]
    let dr1 = [0, 0, 1, -1]

    let dc2 = [1, 1, -1, -1]
    let dr2 = [1, -1, 1, -1]

    let dc3 = [2, -2, 0, 0, 2, 2, -2, -2]
    let dr3 = [0, 0, 2, -2, 2, -2, 2, -2]

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const p = this.flatten(i, j)

        for (let d = 0; d < 4; d++) {
          let ii = i + dr1[d]
          let jj = j + dc1[d]
          if (this.check(ii, jj)) {
            this.springs.push(new Spring(this, p, this.flatten(ii, jj), 1000))
          }
        }

        for (let d = 0; d < 4; d++) {
          let ii = i + dr2[d]
          let jj = j + dc2[d]
          if (this.check(ii, jj)) {
            this.springs.push(new Spring(this, p, this.flatten(ii, jj), 1200))
          }
        }

        for (let d = 0; d < 4; d++) {
          let ii = i + dr3[d]
          let jj = j + dc3[d]
          if (this.check(ii, jj)) {
            this.springs.push(new Spring(this, p, this.flatten(ii, jj), 1400))
          }
        }
      }
    }
  }

  createFaces() {
    for (let i = 0; i < this.height - 1; i++) {
      for (let j = 0; j < this.width - 1; j++) {
        const p1 = i * this.width + j
        const p2 = p1 + 1
        const p3 = p1 + this.width
        this.faces.push(new Face3(p1, p2, p3))
      }
    }

    for (let i = this.height - 1; i > 0; i--) {
      for (let j = this.width - 1; j > 0; j--) {
        const p1 = i * this.width + j;
        const p2 = p1 - 1;
        const p3 = p1 - this.width;
        this.faces.push(new Face3(p1, p2, p3));
      }
    }

    this.computeFaceNormals()
    this.computeVertexNormals()
  }

  computeForces() {
    for (let i in this.vertices) {
      this.forces[i].set(0, 0, 0)
      if (!this.pinned[i])
        this.forces[i].add(new Vector3(0, -9.8, 0)) // gravity
      this.forces[i].sub(this.velocities[i].clone().multiplyScalar(this.DAMPING)) // damping
    }

    let p1p2 = new Vector3()
    let v1v2 = new Vector3()
    let n = new Vector3()

    for (let i in this.springs) {
      const idx1 = this.springs[i].p1
      const idx2 = this.springs[i].p2

      p1p2.subVectors(this.vertices[idx2], this.vertices[idx1])

      n.copy(p1p2)
      n.normalize()

      v1v2.subVectors(this.velocities[idx2], this.velocities[idx1])

      let deltaX = p1p2.length() - this.springs[i].restDistance

      let f1 = -this.springs[i].K * deltaX / 2
      const u = 0.9
      let f2 = Math.exp(-0.5 * deltaX * deltaX / (u * u))
      let springForce = f1 / f2

      let damperForce = -1.5 * v1v2.dot(n)

      let spring_damper_force = n.multiplyScalar(springForce + damperForce)

      if (!this.pinned[idx2])
        this.forces[idx2].add(spring_damper_force);

      if (!this.pinned[idx1])
        this.forces[idx1].sub(spring_damper_force);
    }
  }

  update(dt) {
    this.verticesNeedUpdate = true
    for (let i in this.vertices) {
      let prevVelocity = this.velocities[i]
      this.velocities[i].add(this.forces[i].clone().multiplyScalar(dt / this.MASS))
      this.vertices[i].add(prevVelocity.clone().multiplyScalar(dt))
    }
  }
}

export default Cloth;
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

    this.width = width;
    this.height = height;

    this.MASS = 1;

    this.DAMPING = 1.7

    this.springs = new Array();
    this.forces = new Array();
    this.velocities = new Array();

    // is vertex[i] pinned or not?
    this.pinned = new Int8Array(width * height);

    this.airDensity = 300;
    this.kDrag = 2;
    this.kLift = 5;
    this.airVelocity = new Vector3(1, 1, 1);

    this.pin();
    this.createParticles();
    this.createSprings()
    this.createFaces();
    this.t = 0;
  }

  pin() {
    this.pinned[0] = 1
    this.pinned[this.width - 1] = 1
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
    const color = new Color(0x000000);
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
      if (!this.pinned[i])
        this.forces[i].add(new Vector3(0, -9.8, 0)) // gravity
      this.forces[i].sub(this.velocities[i].clone().multiplyScalar(this.DAMPING)) // damping
    }

    for (let face of this.faces) {
      // if (this.t) break;
      // const f = this.computeAirDrag(face);
      this.addAirForce(face);
    }

    let p1p2 = new Vector3()
    let v1v2 = new Vector3()
    let n = new Vector3()

    for (let i in this.springs) {
      let idx1 = this.springs[i].p1
      let idx2 = this.springs[i].p2

      let p1 = this.vertices[idx1]
      let p2 = this.vertices[idx2]
      p1p2.subVectors(p1, p2)

      n.copy(p1p2)
      n.normalize()

      let dist = p1p2.length()

      let magnitude = -this.springs[i].K * (dist - this.springs[i].restDistance) / 2

      let springForce = (p1p2.normalize()).multiplyScalar(magnitude)

      let v1 = this.velocities[idx1]
      let v2 = this.velocities[idx2]
      v1v2.subVectors(v1, v2)
      
      // let dampingForce = v1v2.do

      if (!this.pinned[idx1])
        this.forces[idx1].add(springForce);

      if (!this.pinned[idx2])
        this.forces[idx2].sub(springForce);
    }
  }

  calcVSurface(face) {
    const { a, b, c } = face;
    const temp = new Vector3(0, 0, 0);
    temp.add(this.velocities[a]);
    temp.add(this.velocities[b]);
    temp.add(this.velocities[c]);
    return temp.multiplyScalar(1 / 3);
  }

  calcVRel(face) {
    const vSurface = this.calcVSurface(face);
    return vSurface.add(this.airVelocity).normalize();
  }


  calcSurfaceArea(face) {
    const { a, b, c } = face;
    const vrel = this.calcVRel(face);
    const l1 = this.vertices[b].clone().sub(this.vertices[a]);
    const l2 = this.vertices[c].clone().sub(this.vertices[a]);
    const cross = l1.clone().cross(l2);
    const length = cross.length();
    const normal = cross.multiplyScalar(1 / length);
    const area = 0.5 * length;
    normal.multiplyScalar(area);
    return Math.abs(normal.dot(vrel) / vrel.length());
  }

  calcAirDragForce(face) {
    const vrel = this.calcVRel(face);
    const vrelLength = vrel.length();
    const num = 0.5 * this.airDensity * this.kDrag * this.calcSurfaceArea(face) * (vrelLength ** 2) * (face.normal.clone().dot(vrel))
    return vrel.multiplyScalar(-num);
  }

  calcAirLiftingForce(face) {
    const vrel = this.calcVRel(face);
    const vrelLength = vrel.length();
    const num = 0.5 * this.airDensity * this.kLift * this.calcSurfaceArea(face) * (vrelLength ** 2) * Math.cos(vrel.angleTo(face.normal));
    const u = face.normal.clone().cross(vrel).cross(vrel);
    return u.multiplyScalar(num);
  }

  addAirForce(face) {
    const drag = this.calcAirDragForce(face);
    const lift = this.calcAirLiftingForce(face);
    const { a, b, c } = face;
    const avg = drag.add(lift).multiplyScalar(1 / 3);
    if (!this.pinned[a])
      this.forces[a].add(avg);
    if (!this.pinned[b])
      this.forces[b].add(avg);
    if (!this.pinned[c])
      this.forces[c].add(avg);
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
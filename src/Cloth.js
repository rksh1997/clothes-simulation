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

    this.airDensity = 300;
    this.kDrag = 2;
    this.kLift = 5;
    this.airVelocity = new Vector3(1, 1, 1);

    this.createBall = false
    this.ballPos = new Vector3(0, 2, 2)
    this.ballRadius = 0.8

    this.pin();
    this.createParticles();
    this.createSprings()
    this.createFaces();
  }

  pin() {
    // for (let i = 0; i < this.height; i++) {
    //   this.pinned[this.width - 1 + this.width * i] = 1
    // }
    // for (let i = 0; i < this.width; i++) {
    //   this.pinned[i] = 1
    // }
    this.pinned[this.flatten(0, 0)] = 1
    this.pinned[this.flatten(0, this.width - 1)] = 1
    // this.pinned[this.flatten(this.height - 1, this.width - 1)] = 1
    // this.pinned[this.flatten(this.height - 1, 0)] = 1
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
    let di = [0, 1, 1, -1, 0, 2]
    let dj = [1, 0, 1, 1, 2, 0]

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const p = this.flatten(i, j)
        for (let d = 0; d < di.length; d++) {
          let ii = i + di[d]
          let jj = j + dj[d]
          if (this.check(ii, jj)) {
            this.springs.push(new Spring(this, p, this.flatten(ii, jj), 1000))
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

      let f1 = -this.springs[i].K * deltaX
      const u = 0.8
      let f2 = Math.exp(-0.5 * deltaX * deltaX / (u * u))
      let springForce = f1 / f2

      let damperForce = -1.5 * v1v2.dot(n)

      let spring_damper_force = n.multiplyScalar(springForce + damperForce)

      if (!this.pinned[idx2])
        this.forces[idx2].add(spring_damper_force);

      if (!this.pinned[idx1])
        this.forces[idx1].sub(spring_damper_force);
    }

    // let windMagnitude = 1 //Math.cos(Date.now() / 600)
    // let windForce = new Vector3()
    // windForce.set(1, 1, 1).normalize().multiplyScalar(windMagnitude)
    // // windForce.set(
    // //   Math.sin(Date.now() / 600),
    // //   Math.cos(Date.now() / 600),
    // //   Math.sin(Date.now() / 600)
    // // ).normalize().multiplyScalar(windMagnitude);

    // for (let face of this.faces) {
    //   const {
    //     a,
    //     b,
    //     c
    //   } = face;
    //   let normal = face.normal
    //   let cur = new Vector3()
    //   cur.copy(normal).normalize().multiplyScalar(normal.dot(windForce))
    //   if (!this.pinned[a])
    //     this.forces[a].add(cur)
    //   if (!this.pinned[b])
    //     this.forces[b].add(cur)
    //   if (!this.pinned[c])
    //     this.forces[c].add(cur)
    // }

    // for (let face of this.faces) {
    //   this.addAirForce(face);
    // }
  }

  calcVSurface(face) {
    const {
      a,
      b,
      c
    } = face;
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
    const {
      a,
      b,
      c
    } = face;
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
    const {
      a,
      b,
      c
    } = face;
    const avg = drag.add(lift).multiplyScalar(1 / 3);
    if (!this.pinned[a])
      this.forces[a].add(avg);
    if (!this.pinned[b])
      this.forces[b].add(avg);
    if (!this.pinned[c])
      this.forces[c].add(avg);
  }

  lengthConstraint(p1, p2, restDistance) {
    let diff = new Vector3()
    diff.subVectors(this.vertices[p2], this.vertices[p1])
    let currentDist = diff.length()
    if (currentDist == 0) return
    var correction = diff.multiplyScalar((currentDist - restDistance) / currentDist)
    var correctionHalf = correction.multiplyScalar(0.5)
    if (!this.pinned[p1])
      this.vertices[p1].add(correctionHalf)
    if (!this.pinned[p2])
      this.vertices[p2].sub(correctionHalf)
  }

  repel(p1, p2, restDistance) {
    let diff = new Vector3()
    diff.subVectors(this.vertices[p2], this.vertices[p1])
    let currentDist = diff.length()
    if (currentDist == 0) return
    if (currentDist < restDistance) {
      var correction = diff.multiplyScalar((currentDist - restDistance) / currentDist)
      var correctionHalf = correction.multiplyScalar(0.5)
      if (!this.pinned[p1])
        this.vertices[p1].add(correctionHalf)
      if (!this.pinned[p2])
        this.vertices[p2].sub(correctionHalf)
    }
  }

  update(dt) {
    this.verticesNeedUpdate = true
    for (let i in this.vertices) {
      let prevVelocity = this.velocities[i]
      this.velocities[i].add(this.forces[i].clone().multiplyScalar(dt / this.MASS))
      this.vertices[i].add(prevVelocity.clone().multiplyScalar(dt))
    }

    if (this.createBall) {
      const added = 0.05
      for (let i in this.vertices) {
        let p = this.vertices[i]
        if (p.distanceTo(this.ballPos) < this.ballRadius + added) {
          let to = new Vector3()
          to.subVectors(p, this.ballPos).normalize().multiplyScalar(this.ballRadius + added)
          p.copy(to.add(this.ballPos))

          let surfaceNormal = new Vector3()
          surfaceNormal.subVectors(p, this.ballPos)

          this.velocities[i].sub(surfaceNormal.multiplyScalar((1 + 1) * this.velocities[i].dot(surfaceNormal)))
        }
      }
    }

    // for (let i in this.springs) {
    //   let idx1 = this.springs[i].p1
    //   let idx2 = this.springs[i].p2
    //   let restDistance = this.springs[i].restDistance
    //   this.lengthConstraint(idx1, idx2, restDistance)
    // }

    // for (let i in this.vertices) {
    //   for (let j in this.vertices) {
    //     this.repel(i, j, 1 / this.width)
    //   }
    // }
  }
}

export default Cloth;
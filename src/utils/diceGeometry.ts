export type Vec3 = [number, number, number]
export interface DieFace { vertices: Vec3[]; center: Vec3; normal: Vec3; right: Vec3; up: Vec3 }

const add = (a: Vec3, b: Vec3): Vec3 => a.map((v, i) => v + b[i]) as Vec3
const subtract = (a: Vec3, b: Vec3): Vec3 => a.map((v, i) => v - b[i]) as Vec3
const scale = (a: Vec3, k: number): Vec3 => a.map((v) => v * k) as Vec3
export const dot = (a: Vec3, b: Vec3) => a.reduce((sum, v, i) => sum + v * b[i], 0)
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const normalize = (a: Vec3): Vec3 => scale(a, 1 / Math.hypot(...a))

function face(vertices: Vec3[]): DieFace {
  const center = scale(vertices.reduce(add, [0, 0, 0]), 1 / vertices.length)
  let normal = normalize(cross(subtract(vertices[1], vertices[0]), subtract(vertices[2], vertices[0])))
  if (dot(normal, center) < 0) normal = scale(normal, -1)
  const right = Math.abs(normal[1]) > 0.99 ? ([1, 0, 0] as Vec3) : normalize(cross([0, 1, 0], normal))
  return { vertices, center, normal, right, up: cross(normal, right) }
}

function trapezohedron(): DieFace[] {
  const pole = 1.05
  const cosine = Math.cos(Math.PI / 5)
  const height = (pole * (1 - cosine)) / (1 + cosine)
  const ring: Vec3[] = Array.from({ length: 10 }, (_, i) => {
    const angle = Math.PI / 2 + ((i - 1) * Math.PI) / 5
    return [Math.cos(angle), i % 2 === 0 ? height : -height, Math.sin(angle)]
  })
  return Array.from({ length: 10 }, (_, i) => face([[0, i % 2 === 0 ? pole : -pole, 0], ring[i], ring[(i + 1) % 10], ring[(i + 2) % 10]]))
}

const D10 = trapezohedron()

function rotate([x, y, z]: Vec3, [rx, ry, rz]: Vec3): Vec3 {
  ;[y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)]
  ;[x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)]
  return [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz), z]
}

function rollAngles(progress: number): Vec3 {
  if (progress <= 0 || progress >= 1) return [0, 0, 0]
  const turn = Math.PI * 2 * (1 - (1 - progress) ** 2)
  return [turn * 3, turn * 5, turn]
}

export function projectD10(progress = 1) {
  const align = Math.atan2(D10[0].normal[1], D10[0].normal[2])
  const pose = (point: Vec3) => rotate(rotate(rotate(point, [align, 0, 0]), [0.08, -0.1, 0]), rollAngles(progress))
  const size = 28
  const lift = Math.sin(Math.PI * progress) * 7
  const screen = (point: Vec3): [number, number] => [40 + point[0] * size, 44 - point[1] * size - lift]
  return D10.map((item, index) => {
    const normal = pose(item.normal)
    const center = pose(item.center)
    const [x, y] = screen(center)
    const right = scale(pose(item.right), 0.028)
    const up = scale(pose(item.up), 0.028)
    const light = Math.max(0, dot(normal, normalize([-0.5, 0.8, 1])))
    const shade = 0.52 + 0.48 * light
    return {
      index, depth: center[2], visible: normal[2] > 0.001,
      points: item.vertices.map((v) => screen(pose(v)).join(',')).join(' '), shade,
      insetPoints: item.vertices.map((v) => screen(pose(add(scale(v, 0.955), scale(item.center, 0.045)))).join(',')).join(' '),
      marking: `matrix(${right[0] * size} ${-right[1] * size} ${-up[0] * size} ${up[1] * size} ${x} ${y})`,
    }
  }).filter((item) => item.visible).sort((a, b) => a.depth - b.depth)
}

export function d10Labels(result: string): string[] {
  const labels = Array<number>(D10.length).fill(-1)
  const values = Array.from({ length: 10 }, (_, i) => i)
  const front = Number(result)
  for (let i = 0; i < D10.length; i++) {
    if (labels[i] !== -1) continue
    const value = i === 0 ? front : values.find((v) => !labels.includes(v))!
    labels[i] = value
    const opposite = D10.findIndex((other) => dot(D10[i].normal, other.normal) < -0.999)
    if (opposite >= 0) labels[opposite] = 9 - value
  }
  return labels.map(String)
}

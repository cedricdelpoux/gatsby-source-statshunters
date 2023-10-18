const fetch = require("node-fetch")

const Z = 14

const xToLon = function (x) {
  return (x / Math.pow(2, Z)) * 360 - 180
}

const yToLat = function (y) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, Z)
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

const tileToCoords = function ({x, y}) {
  const topLat = yToLat(y, Z)
  const topLng = xToLon(x, Z)
  const bottomLat = yToLat(y + 1, Z)
  const bottomLng = xToLon(x + 1, Z)

  return [
    [bottomLng, bottomLat],
    [bottomLng, topLat],
    [topLng, topLat],
    [topLng, bottomLat],
    [bottomLng, bottomLat],
  ]
}

const getTilesFromSquare = function (square) {
  const tiles = []
  for (let x = square.x1; x <= square.x2; x++) {
    for (let y = square.y1; y <= square.y2; y++) {
      tiles.push({x, y})
    }
  }
  return tiles
}

const filterTiles = function (tiles) {
  return (a) => !tiles.find((b) => b.x == a.x && b.y == a.y)
}

exports.sourceNodes = async (
  {
    actions: {createNode},
    createNodeId,
    createContentDigest,
    loadNodeContent,
    store,
    cache,
    reporter,
  },
  pluginOptions = {}
) => {
  if (!pluginOptions.api_key) {
    return
  }

  const timer = reporter.activityTimer(
    `source-statshunters: Creating StatsHunters node`
  )

  if (pluginOptions.debug) {
    timer.start()
  }

  try {
    const url = `https://www.statshunters.com/api/${pluginOptions.api_key}/tiles`
    const response = await fetch(url)
    const statsHunters = await response.json()
    const cluster = [...statsHunters.cluster, ...statsHunters.restCluster]
    const square = getTilesFromSquare(statsHunters.square)

    createNode({
      id: createNodeId(`StatsHunters`),
      internal: {
        type: "StatsHunters",
        content: JSON.stringify(statsHunters),
        contentDigest: createContentDigest(statsHunters),
      },
      square: square.map(tileToCoords),
      cluster: cluster.filter(filterTiles(square)).map(tileToCoords),
      tiles: statsHunters.tiles
        .filter(filterTiles(cluster))
        .filter(filterTiles(square))
        .map(tileToCoords),
    })
  } catch (e) {
    reporter.panic(`source-statshunters: ${e.message}`)
  }

  if (pluginOptions.debug) {
    timer.end()
  }

  return
}

exports.createSchemaCustomization = ({actions: {createTypes}}) => {
  createTypes(`
    type StatsHunters implements Node @dontInfer {
      square: [[[Float]]]
      cluster: [[[Float]]]
      tiles: [[[Float]]]
    }
  `)
}

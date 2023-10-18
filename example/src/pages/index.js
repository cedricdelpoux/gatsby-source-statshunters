import "mapbox-gl/dist/mapbox-gl.css"

import "./index.css"

import MapGL, {
  FullscreenControl,
  NavigationControl,
  ScaleControl,
} from "@urbica/react-map-gl"
import {graphql} from "gatsby"
import React, {useState} from "react"

import {Tiles} from "../components/tiles"

const PageIndex = ({data: {statsHunters}}) => {
  const [viewState, setViewState] = useState({
    zoom: 8,
    longitude: "1.1941289",
    latitude: "43.5928275",
  })

  return (
    <MapGL
      style={{
        height: "100vh",
      }}
      accessToken={process.env.GATSBY_MAPBOX_KEY}
      latitude={viewState.latitude}
      longitude={viewState.longitude}
      zoom={viewState.zoom}
      onViewportChange={(viewport) => setViewState(viewport)}
      attributionControl={false}
    >
      <ScaleControl unit="metric" position="bottom-right" />
      <NavigationControl showCompass showZoom position="top-right" />
      <FullscreenControl position="top-right" />
      <Tiles id="square" tiles={statsHunters.square} color="#428cf4" />
      <Tiles id="cluster" tiles={statsHunters.cluster} color="#2ca57e" />
      <Tiles id="tiles" tiles={statsHunters.tiles} color="#ff0000" />
    </MapGL>
  )
}

export default PageIndex

export const pageQuery = graphql`
  query Index {
    statsHunters {
      square
      tiles
      cluster
    }
  }
`

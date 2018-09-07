import React from 'react';
import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
} from 'react-google-maps';
import { AroundMarker } from './AroundMarker';
import { POS_KEY } from '../constants';

class AroundMap extends React.Component {
    reloadMarkers = () => {
        const center = this.map.getCenter();
        const position = { lat: center.lat(), lon: center.lng() };
        const range = this.getRange();
        this.props.loadNearbyPost(position, range);
    }

    getRange = () => {
        const google = window.google;
        const center = this.map.getCenter();
        const bounds = this.map.getBounds();
        let range = 0;
        if (center && bounds) {
            const ne = bounds.getNorthEast();
            const right = new google.maps.LatLng(center.lat(), ne.lng());
            range = 0.001 * google.maps.geometry.spherical.computeDistanceBetween(center, right);
        }
        return range;
    }

    saveMapRef = (mapInstance) => {
        window.map = mapInstance;
        this.map = mapInstance;
    }

    render() {
        const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
        return(
            <GoogleMap
                ref={this.saveMapRef}
                defaultZoom={11}
                defaultCenter={{ lat, lng: lon }}
                onDragEnd={this.reloadMarkers}
                onZoomChanged={this.reloadMarkers}
            >
                {
                    this.props.posts.map((post) => {
                        return <AroundMarker post={post} key={post.url}/>
                    })
                }
            </GoogleMap>
        );
    }
}

export const WrappedAroundMap = withScriptjs(withGoogleMap(AroundMap));
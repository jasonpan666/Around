import React from 'react';
import {
    Marker,
    InfoWindow,
} from 'react-google-maps';
import blueMarkerUrl from '../assets/images/blue-marker.svg';

export class AroundMarker extends React.Component {
    state = {
        isOpen: false,
    }

    onToggleOpen = () => {
        this.setState((prevState) => {
            return {
                isOpen: !prevState.isOpen,
            }
        });
    }

    render() {
        const { location, url, user, message, type } = this.props.post;
        const isImagePost = type === 'image';
        const icon = isImagePost ? undefined : {
            url: blueMarkerUrl,
            scaledSize: new window.google.maps.Size(26, 41),
        }
        return (
            <Marker
                position={{ lat: location.lat, lng: location.lon }}
                onMouseOver={isImagePost? this.onToggleOpen : undefined}
                onMouseOut={isImagePost? this.onToggleOpen : undefined}
                onClick={isImagePost ? undefined : this.onToggleOpen}
                icon={icon}
            >
                {this.state.isOpen ? (<InfoWindow onCloseClick={this.onToggleOpen}>
                    <div>
                        {
                            isImagePost ?
                                <img src={url} alt={message} className="around-marker-image"/>
                                :
                                <video src={url} className="around-marker-video" controls/>
                        }
                        <p>{`${user}: ${message}`}</p>
                    </div>
                </InfoWindow>) : null}
            </Marker>
        );
    }
}

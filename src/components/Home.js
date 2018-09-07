import React from 'react';
import $ from 'jquery';
import { Tabs, Spin, Row, Col, Radio } from 'antd';
import { GEO_OPTIONS, POS_KEY, API_ROOT, TOKEN_KEY, AUTH_PREFIX } from '../constants';
import { Gallery } from './Gallery';
import { CreatePostButton } from './CreatePostButton';
import { WrappedAroundMap } from './AroundMap';

const RadioGroup = Radio.Group;

export class Home extends React.Component {
    state = {
        loadingGeoLocation: false,
        loadingPosts: false,
        posts: [],
        error: '',
        topic: 'around',
    }

    componentDidMount() {
        this.setState({ loadingGeoLocation: true, error: '' });
        this.getGeolocation();
    }

    getGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS,
            );
        } else {
            this.setState({ loadingGeoLocation: false, error: 'Your browser does not support geolocation.' });
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        this.setState({ loadingGeoLocation: false, error: '' });
        console.log(position);
        const { latitude, longitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({ lat: latitude, lon: longitude }));
        this.loadNearbyPost();
    }

    loadNearbyPost= (location, radius) => {
        this.setState({ loadingPosts: true, error: '' });
        const { lat, lon } = location? location : JSON.parse(localStorage.getItem(POS_KEY));
        const range = radius ? radius : 20;
        const token = localStorage.getItem(TOKEN_KEY);
        const endPoint = this.state.topic === 'around' ? 'search' : 'cluster';
        $.ajax({
            url: `${API_ROOT}/${endPoint}?lat=${lat}&lon=${lon}&range=${range}&term=${this.state.topic}`,
            method: 'GET',
            headers: {
                Authorization: `${AUTH_PREFIX} ${token}`,
            }
        }).then((response) => {
            const posts = response ? response : [];
            this.setState({ posts, loadingPosts: false, error: '' });
            console.log(response);
        }, (response) => {
            console.log(response.responseText);
            this.setState({ loadingPosts: false, error: 'Failed to load posts.' });
        }).catch((e) => {
            console.log(e);
        });
    }

    onFailedLoadGeoLocation = () => {
        console.log('failed to load geo location.');
        this.setState({ loadingGeoLocation: false, error: 'Failed to load geo location.' });
    }

    getPanelContent = (type) => {
        if (this.state.error) {
            return <div>{this.state.error}</div>;
        } else if (this.state.loadingGeoLocation) {
            return <Spin tip="Loading geo location..."/>;
        } else if (this.state.loadingPosts) {
            return <Spin tip="Loading posts..."/>;
        } else if (this.state.posts) {
            return type === 'images' ? this.getImagePosts() : this.getVideoPosts();
        } else {
            return <div>Nothing found...</div>;
        }
    }

    getImagePosts = () => {
        const images = this.state.posts
            .filter((post) => post.type === 'image')
            .map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    caption: post.message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                };
            });
        return (
            <div>
                <Gallery images={images}/>
            </div>
        );
    }

    getVideoPosts = () => {
        return (
            <Row gutter={32}>
                {
                    this.state.posts
                        .filter((post) => post.type === 'video')
                        .map((post) => {
                            return (
                                <Col span={6} >
                                    <video src={post.url} key={post.url} controls className="video-block"/>
                                    <p>{post.user}: {post.message}</p>
                                </Col>);
                        })
                }
            </Row>
        );
    }

    onTopicChange = (e) => {
        this.setState({ topic: e.target.value }, this.loadNearbyPost);
    }

    render() {
        const TabPane = Tabs.TabPane;
        const operations = <CreatePostButton loadNearbyPost={this.loadNearbyPost}/>;
        return (
            <div>
                <RadioGroup className="topic-radio-group" value={this.state.topic} onChange={this.onTopicChange}>
                    <Radio value="around">Posts Around Here</Radio>
                    <Radio value="face">Faces Around The World</Radio>
                </RadioGroup>
                <Tabs tabBarExtraContent={operations} className="main-tabs">
                    <TabPane tab="Image Posts" key="1">
                        {this.getPanelContent('images')}
                    </TabPane>
                    <TabPane tab="Video Posts" key="2">
                        {this.getPanelContent('videos')}
                    </TabPane>
                    <TabPane tab="Map" key="3">
                        <WrappedAroundMap
                            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyD3CEh9DXuyjozqptVB5LA-dN7MxWWkr9s&v=3.exp&libraries=geometry,drawing,places"
                            loadingElement={<div style={{ height: `100%` }} />}
                            containerElement={<div style={{ height: `600px` }} />}
                            mapElement={<div style={{ height: `100%` }} />}
                            posts={this.state.posts}
                            loadNearbyPost={this.loadNearbyPost}
                        />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

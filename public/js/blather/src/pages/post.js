import "./css/index.css";
import { refreshYouTubeToken } from "components/authentication/v1/actions";
import { DisplayMetaTags } from "utils/metaFunctions";
import { fetchPostData } from "pages/actions/post";
import { Provider, connect } from "react-redux";
import {
    Breadcrumb,
    Container,
    Header,
    Image,
    Message,
    Segment,
    Sticky
} from "semantic-ui-react";
import FallacyForm from "components/fallacyForm/v1/";
import FallaciesList from "components/fallaciesList/v1/";
import PageFooter from "components/footer/v1/";
import PageHeader from "components/header/v1/";
import ParagraphPic from "images/short-paragraph.png";
import PropTypes from "prop-types";
import React, { Component } from "react";
import store from "store";
import ThumbnailPic from "images/image.png";
import Tweet from "components/tweet/v1/";
import YouTubeVideo from "components/youTubeVideo/v1/";

class Post extends Component {
    constructor(props) {
        super(props);
        const path = this.props.match.path;
        const id = this.props.match.params.id;
        const commentId = this.props.match.params.commentId;
        const currentState = store.getState();
        const authenticated = currentState.user.authenticated;
        const bearer = currentState.user.bearer;
        const { network, type, url } = this.postType(id, commentId, path);
        this.state = {
            authenticated,
            bearer,
            commentId,
            id,
            network,
            type
        };

        this.props.fetchPostData({
            bearer: currentState.user.bearer,
            url
        });
    }

    handleContextRef = contextRef => this.setState({ contextRef });

    postType(id, commentId, path) {
        switch (path) {
            case "/tweet/:id":
                return {
                    network: "twitter",
                    type: "tweet",
                    url: `twitter/tweet?id=${id}`
                };
            case "/video/:id":
                return {
                    network: "youtube",
                    type: "video",
                    url: `youtube/video?id=${id}`
                };
            case "/video/:id/commentId":
                return {
                    network: "youtube",
                    type: "youtube_comment",
                    url: ``
                };
            default:
                return false;
        }
    }

    render() {
        const {
            authenticated,
            bearer,
            commentId,
            contextRef,
            id,
            network,
            type
        } = this.state;
        if (
            this.props.error &&
            this.props.errorCode !== 404 &&
            network === "youtube"
        ) {
            this.props.refreshYouTubeToken({
                bearer
            });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

        const videoExists =
            this.props.error &&
            this.props.errorCode === 404 &&
            network === "youtube"
                ? false
                : true;
        const containerClassName = this.props.info
            ? "mainContainer bc"
            : "mainContainer";
        const user = this.props.info
            ? network === "twitter"
                ? this.props.info.user
                : this.props.info.channel
            : null;
        const Breadcrumbs = props => {
            console.log("breadcrumbs");
            console.log(props);
            if (props.info) {
                switch (type) {
                    case "tweet":
                        if (props.info.user) {
                            return (
                                <Breadcrumb>
                                    <Breadcrumb.Section
                                        link
                                        onClick={() =>
                                            this.props.history.push(
                                                "/search/twitter"
                                            )
                                        }
                                    >
                                        Twitter profiles
                                    </Breadcrumb.Section>
                                    <Breadcrumb.Divider icon="right chevron" />
                                    <Breadcrumb.Section
                                        link
                                        onClick={() =>
                                            this.props.history.push(
                                                `/pages/twitter/${
                                                    props.info.user.screen_name
                                                }`
                                            )
                                        }
                                    >
                                        {props.info.user.name}
                                    </Breadcrumb.Section>
                                    <Breadcrumb.Divider icon="right chevron" />
                                    <Breadcrumb.Section
                                        link
                                        onClick={() =>
                                            this.props.history.push(
                                                `/pages/twitter/${
                                                    props.info.user.screen_name
                                                }/tweets`
                                            )
                                        }
                                    >
                                        Tweets
                                    </Breadcrumb.Section>
                                    <Breadcrumb.Divider icon="right chevron" />
                                    <Breadcrumb.Section active>
                                        {props.info.id}
                                    </Breadcrumb.Section>
                                </Breadcrumb>
                            );
                        }
                        break;
                    case "video":
                        if (props.info.channel) {
                            return (
                                <Breadcrumb>
                                    <Breadcrumb.Section
                                        link
                                        onClick={() =>
                                            this.props.history.push(
                                                "/search/youtube"
                                            )
                                        }
                                    >
                                        YouTube channels
                                    </Breadcrumb.Section>
                                    <Breadcrumb.Divider icon="right chevron" />
                                    <Breadcrumb.Section
                                        link
                                        onClick={() =>
                                            this.props.history.push(
                                                `/pages/youtube/${
                                                    props.info.channel.id
                                                }`
                                            )
                                        }
                                    >
                                        {props.info.channel.title}
                                    </Breadcrumb.Section>
                                    <Breadcrumb.Divider icon="right chevron" />
                                    <Breadcrumb.Section
                                        link
                                        onClick={() =>
                                            this.props.history.push(
                                                `/pages/youtube/${
                                                    props.info.channel.id
                                                }/videos`
                                            )
                                        }
                                    >
                                        Videos
                                    </Breadcrumb.Section>
                                    <Breadcrumb.Divider icon="right chevron" />
                                    <Breadcrumb.Section active>
                                        {props.info.id}
                                    </Breadcrumb.Section>
                                </Breadcrumb>
                            );
                        }
                        break;
                    default:
                        return null;
                }
            }
            return null;
        };
        const DisplayFallacies = props => {
            if (props.info) {
                return (
                    <div style={{ marginTop: "1.2em" }}>
                        <Header dividing size="medium">
                            Fallacies
                        </Header>
                        <FallaciesList
                            emptyMsgHeader={false}
                            emptyMsgContent={`No fallacies have been assigned to this ${type}`}
                            network={network}
                            objectId={props.info.id}
                            source="post"
                            {...props}
                        />
                    </div>
                );
            }
        };
        const DisplayPost = props => {
            switch (type) {
                case "tweet":
                    if (props.info) {
                        return (
                            <div>
                                <Tweet
                                    archive={props.archive}
                                    bearer={bearer}
                                    canArchive
                                    created_at={props.info.created_at}
                                    extended_entities={
                                        props.info.extended_entities
                                    }
                                    full_text={props.info.full_text}
                                    id={props.info.id_str}
                                    is_quote_status={props.info.is_quote_status}
                                    quoted_status={
                                        props.info.quoted_status ===
                                            undefined &&
                                        props.info.is_quote_status
                                            ? props.info.retweeted_status
                                            : props.info.quoted_status
                                    }
                                    quoted_status_id_str={
                                        props.info.quoted_status_id_str
                                    }
                                    quoted_status_permalink={
                                        props.info.quoted_status_permalink
                                    }
                                    retweeted_status={
                                        props.info.retweeted_status ===
                                        undefined
                                            ? false
                                            : props.info.retweeted_status
                                    }
                                    stats={{
                                        favorite_count:
                                            props.info.favorite_count,
                                        retweet_count: props.info.retweet_count
                                    }}
                                    user={props.info.user}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <Segment className="lazyLoadSegment">
                                    <Image fluid src={ParagraphPic} />
                                </Segment>
                            </div>
                        );
                    }
                case "video":
                    if (props.info) {
                        return (
                            <div>
                                <YouTubeVideo
                                    archive={props.archive}
                                    bearer={bearer}
                                    canArchive
                                    channel={props.info.channel}
                                    dateCreated={props.info.date_created}
                                    description={props.info.description}
                                    history={props.history}
                                    id={props.info.id}
                                    placeholder={props.info.img}
                                    showComments
                                    stats={props.info.stats}
                                    title={props.info.title}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <Segment className="lazyLoadSegment">
                                    <Image
                                        centered
                                        size="large"
                                        src={ThumbnailPic}
                                    />
                                </Segment>
                            </div>
                        );
                    }
                case "youtube_comment":
                    return <div />;
                default:
                    return null;
            }
        };
        const pageInfo = user
            ? {
                  id: `${user.id}`,
                  name: network === "youtube" ? user.title : user.name,
                  type: network,
                  username: network === "youtube" ? null : user.screen_name
              }
            : null;

        return (
            <Provider store={store}>
                <div className="postPage">
                    <DisplayMetaTags
                        page="post"
                        props={this.props}
                        state={this.state}
                    />
                    <PageHeader {...this.props} />
                    {this.props.info && (
                        <Sticky className="sticky" context={contextRef}>
                            <div className="breadcrumbContainer">
                                <Container>{Breadcrumbs(this.props)}</Container>
                            </div>
                        </Sticky>
                    )}

                    <Container
                        className={containerClassName}
                        ref={this.handleContextRef}
                        text
                        textAlign="left"
                    >
                        {DisplayPost(this.props)}
                        {!videoExists && (
                            <Message
                                content="This video does not exist"
                                error
                            />
                        )}
                        {!this.props.error && (
                            <div style={{ marginTop: "16px" }}>
                                <FallacyForm
                                    authenticated={authenticated}
                                    bearer={bearer}
                                    commentId={commentId}
                                    history={this.props.history}
                                    network={network}
                                    objectId={id}
                                    pageInfo={pageInfo}
                                    user={user}
                                />
                                {DisplayFallacies(this.props)}
                            </div>
                        )}
                    </Container>
                    <PageFooter />
                </div>
            </Provider>
        );
    }
}

Post.propTypes = {
    archive: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.shape({
            code: PropTypes.string,
            date_created: PropTypes.string,
            link: PropTypes.string
        })
    ]),
    info: PropTypes.object,
    fallacyCount: PropTypes.number,
    refreshYouTubeToken: PropTypes.func,
    type: PropTypes.string
};

Post.defaultProps = {
    data: null,
    refreshYouTubeToken: refreshYouTubeToken
};

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.post,
        ...state.user,
        ...ownProps
    };
};

export default connect(
    mapStateToProps,
    { fetchPostData, refreshYouTubeToken }
)(Post);
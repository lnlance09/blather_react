import './style.css';
import { fetchComments, postComment } from 'pages/actions/fallacy';
import { adjustTimezone } from 'utils/dateFunctions';
import { connect } from 'react-redux';
import { 
    Button,
    Comment,
    Form,
    Image,
    Segment
} from 'semantic-ui-react';
import Moment from 'react-moment';
import defaultImg from 'pages/images/trump.svg';
import ParagraphPic from 'images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class CommentsSection extends Component {
    constructor(props) {
        super(props)
        this.state = {
            message: ''
        }
        this.onChangeMessage = this.onChangeMessage.bind(this)
        this.onSubmitForm = this.onSubmitForm.bind(this)
    }

    componentWillMount() {
        this.props.fetchComments({
            id: this.props.id,
            page: 0
        })
    }

    onChangeMessage = (e, { value }) => this.setState({ message: value })

    onSubmitForm(e) {
        if(this.state.message !== '') {
            this.props.postComment({
                bearer: this.props.bearer,
                id: this.props.id,
                message: this.state.message
            })
            this.setState({ message: '' })
        }
    }

    render() {
        const { message } = this.state
        const placeholder = this.props.comments.count === 0 ? 'Be the first to comment...' : 'Add a comment...'
        const RenderComments = props => {
            if(props.comments.count > 0) {
                return props.comments.results.map((comment, i) => {
                    return (
                        <Comment key={`fallacy_comment_${i}`}>
                            <Comment.Avatar 
                                size='tiny' 
                                src={comment.img ? comment.img : defaultImg} 
                            />
                            <Comment.Content>
                                <Comment.Author 
                                    as='a'
                                    onClick={() => props.history.push(`/users/${comment.username}`)}
                                >
                                    {comment.name}
                                </Comment.Author>
                                <Comment.Metadata>
                                    <div><Moment date={adjustTimezone(comment.created_at)} fromNow /></div>
                                </Comment.Metadata>
                                <Comment.Text>
                                    {comment.message}
                                </Comment.Text>
                            </Comment.Content>
                        </Comment>
                    )
                })
            }

            if(props.comments.count === 0) {
                return (
                    <p style={{ textAlign: 'center' }}>No comments yet...</p>
                )
            }

            return [{},{},{},{},{},{},{}].map((comment, i) => (
                <Segment key={`lazyLoadComment_${i}`} className='lazyLoadSegment'>
                    <Image fluid src={ParagraphPic} />
                </Segment>
            ))
        }

        const ReplyForm = props => (
            <Form
                onSubmit={this.onSubmitForm}
            >
                <Form.TextArea 
                    onChange={this.onChangeMessage}
                    placeholder={placeholder}
                    value={message}
                />
                <Button 
                    compact
                    content='Post' 
                    style={{ float: 'right', marginRight: '0' }}
                    type='submit'
                />
                <div className='clearfix'></div>
            </Form>
        )

        return (
            <div className='commentsSection'>
                {this.props.authenticated && (
                    <div>
                        {ReplyForm(this.props)}
                    </div>
                )}
                <Comment.Group>
                    {RenderComments(this.props)}
                </Comment.Group>
            </div>
        )
    }
}

CommentsSection.propTypes = {
    authenticated: PropTypes.bool,
    bearer: PropTypes.string,
    comments: PropTypes.shape({
        count: PropTypes.number,
        results: PropTypes.array
    }),
    id: PropTypes.number,
    fetchComments: PropTypes.func,
    submitComment: PropTypes.func
}

CommentsSection.defaultProps = {
    comments: {
        count: 0,
        results: [{},{},{},{},{},{},{}]
    },
    fetchComments: fetchComments,
    postComment: postComment
}

const mapStateToProps = (state, ownProps) => ({
    ...state.fallacy,
    ...ownProps
})

export default connect(mapStateToProps, { fetchComments, postComment })(CommentsSection)
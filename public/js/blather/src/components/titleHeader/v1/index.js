import './style.css';
import { updateDiscussion } from '../../../pages/actions/discussion';
import { updateFallacy } from '../../../pages/actions/fallacy';
import { connect } from 'react-redux';
import { 
    Header,
    Icon,
    Input
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class TitleHeader extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editing: false,
            value: this.props.title
        }

        this.onChangeTitle = this.onChangeTitle.bind(this)
    }

    onChangeTitle = (e, { value }) => this.setState({ value })
    updateHeader = () => {
        this.setState({ editing: false })
        if(this.props.type === 'fallacy') {
            this.props.updateFallacy({ 
                bearer: this.props.bearer,
                id: this.props.id,
                title: this.state.value
            })
        }

        if(this.props.type === 'discussion') {
            this.props.updateDiscussion({ 
                bearer: this.props.bearer,
                id: this.props.id,
                title: this.state.value
            })
        }
    }

    render() {
        const { editing, value } = this.state
        const EditIcon = props => {
            if(props.canEdit) {
                return (
                    <Icon 
                        className='editHeaderIcon' 
                        name={editing ? 'close' : 'pencil'} 
                        onClick={() => this.setState({ editing: editing ? false : true })}
                        size='small'
                    />
                )
            }
            return null
        }
        return (
            <div className='titleHeader'>
                {this.props.title && (
                    <Header as='h1' dividing={this.props.dividing}>
                        {editing && (
                            <div>
                                <Input
                                    className='titleInput' 
                                    onChange={this.onChangeTitle}
                                    placeholder='Title' 
                                    value={value} 
                                />
                                <Icon 
                                    className='editHeaderIcon check' 
                                    name='check' 
                                    onClick={this.updateHeader}
                                    size='small'
                                />
                                {EditIcon(this.props)}
                            </div>
                        )}

                        {!editing && (
                            <div>
                                {this.props.title}
                                {EditIcon(this.props)}
                            </div>
                        )}

                        {this.props.subheader && (
                            <Header.Subheader>
                                {this.props.subheader}
                            </Header.Subheader>
                        )}
                    </Header>
                )}

                {!this.props.title && (
                    <div style={{ height: '55px' }}></div>
                )}
            </div>
        )
    }
}

TitleHeader.propTypes = {
    bearer: PropTypes.string,
    canEdit: PropTypes.bool,
    dividing: PropTypes.bool,
    id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    subheader: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object,
        PropTypes.string
    ]),
    title: PropTypes.string,
    type: PropTypes.string,
    updateFallacy: PropTypes.func
}

TitleHeader.defaultProps = {
    canEdit: false,
    dividing: false,
    updateFallacy: updateFallacy
}

const mapStateToProps = (state, ownProps) => ({
    ...state.discussion,
    ...state.fallacy,
    ...ownProps
})

export default connect(mapStateToProps, { 
    updateDiscussion, 
    updateFallacy 
})(TitleHeader)
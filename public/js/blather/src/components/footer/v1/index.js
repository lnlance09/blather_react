import './style.css';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
    Container,
    List,
    Segment
} from 'semantic-ui-react';
import React, { Component } from 'react';

class Footer extends Component {
    componentWillMount() {
        
    }

    render() {
        return (
            <Segment
                attached='bottom' 
                className='footerSegment'
                inverted 
                vertical
            >
                <Container style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                    <List 
                        className='footerList'
                        horizontal 
                        inverted 
                        link
                    >
                        <List.Item><Link to='/about'>About</Link></List.Item>
                        <List.Item><Link to='/about/contact'>Contact Us</Link></List.Item>
                        <List.Item><Link to='/about/privacy'>Privacy Policy</Link></List.Item>
                    </List>
                    <p>© 2018 Blather</p>
                </Container>
            </Segment>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    ...state.footer,
    ...ownProps
})

export default connect(mapStateToProps, { })(Footer)

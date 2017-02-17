import React from 'react';
import {Redirect} from 'react-router';
import {Nav, NavItem} from 'react-bootstrap';
import convert from 'sbgnml-to-cytoscape';
import {httpGetAsync, getPathwayURL, getTraversalURL, parseJSON} from './../helpers/http.js';

import {ErrorMessage} from '../components/ErrorMessage.jsx';
import {Summary} from './tabs/Summary.jsx';
import {Interactions} from './tabs/Interactions.jsx';
import {Publications} from './tabs/Publications.jsx';
import {Downloads} from './tabs/Downloads.jsx';
import {Graph} from './tabs/Graph.jsx';

// Pathway
// Prop Dependencies ::
// - router
// - location
export class Pathway extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pathwayData: {},
			name: ""
		}

		httpGetAsync(getPathwayURL(this.props.location.query.uri, "SBGN"), (responseText) => {
			this.updatePathwayData(responseText);
		});

		var urlName = {
			uri: this.props.location.query.uri,
			path: "Named/displayName"
		};
		httpGetAsync(getTraversalURL(urlName), (responseText) => {
			this.setState({name: parseJSON(responseText).traverseEntry[0].value.pop()});
		});
	}

	updatePathwayData(pathwayString) {
		try {
			pathwayString = convert(pathwayString);
		}
		catch(e) {
			pathwayString = null;
		}
		this.setState({pathwayData: pathwayString});
	}

	handleSelect(eventKey) {
		this.props.router.push({
			pathname: this.props.location.pathname,
			query: {
				uri: this.props.location.query.uri,
				active: eventKey
			}
		});
	}

	render() {
		var active = this.props.location.query.active || "Graph";
		if(this.state.pathwayData) {
			return(
				<div className="Pathway">
					<div className="name jumbotron">
						{this.state.name}
					</div>
					<Nav activeKey={active} onSelect={(e) => this.handleSelect(e)} bsStyle="tabs">
						{/*
						<NavItem eventKey="Summary">
							Summary
						</NavItem>
						<NavItem eventKey="Publications">
							Publications
						</NavItem>
						*/}
						<NavItem eventKey="Interactions">
							Interactions
						</NavItem>
						<NavItem eventKey="Downloads">
							Downloads
						</NavItem>
						<NavItem eventKey="Graph">
							Graph
						</NavItem>
					</Nav>
					<Summary hidden={"Summary" != active}/>
					<Interactions hidden={"Interactions" != active} uri={this.props.location.query.uri}/>
					<Publications hidden={"Publications" != active}/>
					<Downloads hidden={"Downloads" != active} uri={this.props.location.query.uri} name={this.state.name} pathwayData={this.state.pathwayData}/>
					<Graph hidden={"Graph" != active} pathwayData={this.state.pathwayData}/>
				</div>
			);
		}
		else if(this.state.pathwayData === null) {
			return (
				<ErrorMessage className="Pathway">
					Invalid URI
				</ErrorMessage>
			);
		}
		else {
			return(null);
		}
	}
}

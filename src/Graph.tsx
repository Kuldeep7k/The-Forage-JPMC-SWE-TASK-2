import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {   // making the htmlelement dynamic using PerspectiveViewerElement interface
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // If the Perspective table is initialized, configure the perspective-viewer element
      // and load the table data into it.
    
      // Set the type of chart to y_line (line chart)
      elem.setAttribute("view", "y_line");
    
      // Set the columns to pivot on for the table (used for grouping data by these columns)
      elem.setAttribute("column-pivots", '["stock"]');
    
      // Set the rows to pivot on for the table (used for grouping data by these rows)
      elem.setAttribute("row-pivots", '["timestamp"]');
    
      // Specify the columns to display in the chart
      elem.setAttribute("columns", '["top_ask_price"]');
    
      // Set the aggregate functions for the columns to process data
      elem.setAttribute("aggregates", JSON.stringify({
        stock: "distinct count",    // Count distinct values in the stock column
        top_ask_price: "avg",       // Calculate average for top_ask_price
        top_bid_price: "avg",       // Calculate average for top_bid_price
        timestamp: "distinct count" // Count distinct values in the timestamp column
      }));
    
      // Add more Perspective configurations here if needed.
    
      // Load the Perspective table into the perspective-viewer element
      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: (el.top_ask && el.top_ask.price) || 0,
          top_bid_price: (el.top_bid && el.top_bid.price) || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;

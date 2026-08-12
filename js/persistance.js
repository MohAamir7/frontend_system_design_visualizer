import{nodes,canvas,edges, latency, throughput} from './state.js';
import {createRestoreNode} from './node.js';
import {drawline} from './edge.js';
import{addLog} from './logger.js';


const STORAGE_KEY = "sdv:diagram";


export function serializeDiagram() {

    return {
        nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            label: node.el.querySelector('span').textContent || node.type,
            left: node.el.style.left,
            top: node.el.style.top,
            latency: node.latency,
            failure: node.failure,
            throughput: node.throughput,
            maxRetries: node.maxRetries
        })),
        edges: edges.map(edge => ({
            from: nodes.find((n)=>n.el === edge.from)?.id,
            to: nodes.find((n)=>n.el === edge.to)?.id
        }))
        .filter((edge) => edge.from !== undefined && edge.to !== undefined)
    };
}

export function saveToLocalStorage() {
    try {
        const serializedData = localStorage.getItem(STORAGE_KEY,json.stringify(serializeDiagram()));
    }catch (error) {
        console.error("Error loading diagram from localStorage:", error);
    }
}

export function clearCanvas(){
    nodes.slice().forEach((n)=> {
        n.el.remove();
        
    });
    nodes.length =0;
    edges.slice().forEach((e)=>{
        e.line.remove();
        e.hitArea.remove();
    });
    edges.length =0;
}




//util
function getsert<T>(m:Map<string, T>, key:string, defaultConstruct:()=>T){ //gets or inserts default
	if(m.has(key)){
		return m.get(key)
	}else{
		var r = defaultConstruct()
		m.set(key, r)
		return r
	}
}


var newestGnodID = 0
export var nodesByID = new Map<string, Gnod>()
export function getNode(id:NodeID):Gnod{ return nodesByID.get(id) }
export type LinkType = string
export function confirmLinkType(linkType:string):LinkType{
	if(linkType.indexOf(':') >= 0) throw 'invalid link type, must not contain \':\''  //user can't discuss reverse link types? Dunno if it should be this restrictive
	return linkType
}
type ReverseLinkType = string
function oppositeDirectionOfLink(linkType:LinkType):ReverseLinkType {
	if(linkType.length){
		if(linkType[0] == ':'){
			return linkType.substring(1)
		}else{
			return ':'+linkType
		}
	}else{
		return ':'
	}
}
export type NodeID = string
export class Gnod{
	id:string
	links = new Map<string, Map<Gnod, any>>(); //link type, end node, link data
	constructor(graphNodeID?){
		if(graphNodeID !== undefined){
			this.id = ''+graphNodeID
			// if(graphNodeID.indexOf(':') >= 0) throw 'forbidden character in node id (\':\')'
			if(graphNodeID.construcor == Number){
				newestGnodID = Math.max(graphNodeID, newestGnodID)
			}
		}else{
			this.id = ''+(newestGnodID++)
		}
		if(nodesByID.has(this.id)){
			throw 'duplicate node id'
		}
		nodesByID.set(this.id, this)
	}
	destroy(){
		severAllLinks(this)
		nodesByID.delete(this.id)
		this.id = null
	}
}

export function getOrCreateNode(id:NodeID):Gnod{
	return getsert(nodesByID, id, ()=> new Gnod(id))
}


function linkForDirection(an:Gnod, bn:Gnod, dat:any = null, type:LinkType = ""){
	var fortype = getsert(an.links, type, ()=>{
		var init:[Gnod, any][] = [[bn, dat]]
		return new Map(init)
	})
	fortype.set(bn, dat)
}
export function link(an:Gnod, bn:Gnod, dat:any = null, type:LinkType = ""){
	linkForDirection(an, bn, dat, type)
	linkForDirection(bn, an, null, oppositeDirectionOfLink(type))
}

function unlinkForDirection(an:Gnod, bn:Gnod, type:LinkType = ""){
	var fortype = an.links.get(type)
	if(fortype){
		var dat = fortype.get(bn)
		if(dat !== undefined){
			fortype.delete(bn)
			return dat
		}
		if(fortype.size === 0){
			an.links.delete(type)
		}
	}
	return undefined
}
export function unlink(an:Gnod, bn:Gnod, type:LinkType = ""){ //note, if it returns null, it means that the link did exist, but that there was no data. You have to explicitly check === undefined if you want to fully understand the return value
	unlinkForDirection(an,bn, type)
	unlinkForDirection(bn,an, oppositeDirectionOfLink(type))
}

export function getLink(an:Gnod, bn:Gnod, type:LinkType = ""):any { //note, if it returns null, it means that the link did exist, but that there was no data. You have to explicitly check === undefined if you want to fully understand the return value
	var fortype = an.links.get(type)
	if(fortype){
		var dat = fortype.get(bn)
		if(dat !== undefined){
			return dat
		}
	}
	return undefined
}

export function severAllLinks(an:Gnod){
	an.links.forEach((links, linkType)=> {
		links.forEach((dat, bn:Gnod)=> {
			unlinkForDirection(bn, an, oppositeDirectionOfLink(linkType))
		})
	})
	an.links.clear()
}


export function severLinksOfType(an:Gnod, linkType:LinkType){
	var oftype = an.links.get(linkType)
	if(oftype){
		oftype.forEach((dat, bn:Gnod)=> {
			unlinkForDirection(bn, an, linkType)
		})
		oftype.clear()
		an.links.delete(linkType)
	}
}


//unordered linkages basically just use nodeids to orient everything from smallest to largest, so that however you order the nodes in your call you'll get the same results
export function unorderedLink(an:Gnod, bn:Gnod, dat:any = null, type:LinkType = ""){
	if(an.id <= bn.id){
		link(an, bn, dat, type)
	}else{
		link(bn, an, dat, type)
	}
}

export function unorderedUnlink(an:Gnod, bn:Gnod, type:LinkType = ""){
	if(an.id <= bn.id){
		unlink(an, bn, type)
	}else{
		unlink(bn, an, type)
	}
}

export function unorderedGetLink(an:Gnod, bn:Gnod, type:LinkType = ""):any {
	if(an.id <= bn.id){
		return getLink(an, bn, type)
	}else{
		return getLink(bn, an, type)
	}
}

export function forEachLink(an:Gnod, type:LinkType = "", f:(dat:any, bn:Gnod)=>void){
	if(an.links.has(type)){
		an.links.get(type).forEach((dat, bn)=>{ f(dat, bn) })
	}
}

export function forEachPolarLink(
	an:Gnod,
	type:LinkType = "",
	inversionFunc:(any)=>any,
	f:(dat:any, goingTo:Gnod)=>void
){
	if(an.links.has(type)){
		an.links.get(type).forEach((dat, bn:Gnod)=>{ f(dat, bn) })
	}
	var revt = oppositeDirectionOfLink(type)
	if(an.links.has(revt)){
		an.links.get(revt).forEach((dat, bn:Gnod)=>{
			f(inversionFunc(bn.links.get(type).get(an)), bn)
		})
	}
}



export function setPolarLinkData(an:Gnod, bn:Gnod, dat:any, inversionFunc:(any)=>any, type:LinkType = ""){ //inverts if bn.id < an.id
	if(an.id <= bn.id){
		return link(an, bn, dat, type)
	}else{
		return link(bn, an, inversionFunc(dat), type)
	}
}

export function getPolarLinkData(an:Gnod, bn:Gnod, inversionFunc:(any)=>any, type:LinkType = ""){ //inverts if bn.id < an.id
	if(an.id <= bn.id){
		return getLink(an, bn, type)
	}else{
		return inversionFunc(getLink(bn, an, type))
	}
}
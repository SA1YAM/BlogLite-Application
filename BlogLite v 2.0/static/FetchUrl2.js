export default async function FetchUrl2(url, obj){
	let resp = null
	
	let data = null
	
	try{
		resp = await fetch(url, obj)
	}catch{
		throw new Error("Network Connection Failed")
	}
	
	try{
		console.log(resp)
		data = await resp.json()
	}catch{
		throw new Error("Response was not json")
	}
		
	if (resp.ok){
		return data 
	} else {
		throw new Error(data.errors)
	}	
	
}


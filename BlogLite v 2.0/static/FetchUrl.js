export default async function FetchUrl(url, obj){
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
//		return data
		throw new Error(data.response.errors)
	}	
	
}

// FetchUrl("http://127.0.0.1:5000/api/dashboard")
//		.then((data) => {
//			console.log(data)
//		}).catch((err) => {
//		console.log(err)
//		})

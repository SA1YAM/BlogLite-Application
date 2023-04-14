
export default function CheckPostForm(data){
	let errors = []
	console.log(data)
	if(!data.title){
		errors.push("title is required")
	} else {
		if(data.title.length > 20){
			errors.push("title should be less than 20 characters")
		}
		if (data.title.trim().length < 1){
			errors.push("title cannot contain only whitespaces")
		}
	}
	if(!data.caption){
		errors.push("caption is required")
	} else {
		if(data.caption.length > 100){
			errors.push("description should be less than 100 characters")
		}
		if (data.caption.trim().length < 1){
			errors.push("caption cannot contain only whitespaces")
		}
	}
	if(!data.image_url){
		errors.push("image file is required Please choose an image file")
	}
	
	return errors
}
// it is hight order function that takes a function in param 
// and return a function

const asynchandler =(requesthandler)=>{
    return (req,res,next)=>{
        // make a promise so get rid of try
        Promise
        .resolve(requesthandler(req,res,next))
        .catch((err)=>next(err))
    }

};

export {asynchandler}

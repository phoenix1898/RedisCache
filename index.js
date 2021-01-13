const express = require('express')
const fetch = require('node-fetch')
const redis = require('redis')

const port = process.env.PORT || 5000;
const redis_port = process.env.REDIS_PORT || 6379; 

const client = redis.createClient(redis_port)

const app = express();



//Cache function
function cache(req,res)
{
    const {username} = req.params

    client.get(username,(err,data)=>{
        if(err) throw err 

        if(data!==null)
        {
            res.send(Response(username,data))
        }
        
    })
}



//Response to home page
function Response(username,public_repo)
{
    return `<h1>${username} has ${public_repo} public repository </h2>`
}



//Request to github api
async function repoNo(req,res)
{
    try {
        console.log('Fetching data')
        
        const {username} = req.params

        const response = await fetch(`https://api.github.com/users/${username}`)

        const data = await response.json()

        
        const public_repo = data.public_repos

        // Set data to redis
        client.setex(username,1800,public_repo)

        res.send(Response(username,public_repo))
        

    } catch (error) {
        console.log(error)
        res.status(500)
    }
}



app.get('/repo/:username',cache,repoNo)


app.listen(5000, ()=>{
    console.log('App is listening');
})


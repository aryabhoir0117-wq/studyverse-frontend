async function generateQuiz(){

const topic = document.getElementById("topicInput").value;
const container = document.getElementById("generatedQuiz");

container.innerHTML = "Generating quiz...";

try{

const response = await fetch("https://openrouter.ai/api/v1/chat/completions",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"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"
},

body:JSON.stringify({
model:"grok-4-latest",
messages:[
{role:"system",content:"You generate MCQ quizzes."},
{role:"user",content:`Create 3 MCQ questions about ${topic}`}
]
})

});

console.log("Response status:",response.status);

const data = await response.json();

console.log(data);

if(data.choices){
container.innerHTML = `<pre>${data.choices[0].message.content}</pre>`;
}else{
container.innerHTML = "AI returned unexpected response";
}

}catch(err){

console.error(err);
container.innerHTML = "Failed to connect to AI";

}

}
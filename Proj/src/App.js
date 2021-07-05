import './App.css';
import React, { useState, useEffect } from 'react'
import loginService from './services/loginService'
import SignUpService from './services/signUpservice';
import LoginForm from './components/LoginForm'
import SignUpForm from './components/SignUpForm'
import imageCompression from "browser-image-compression";
import Card from "react-bootstrap/Card";

const App=()=>{
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errormessage,setErrorMessage]=useState(null)
  const [loginVisible, setLoginVisible] = useState(false)
  const [signUpVisible, setSignupVisible] = useState(false)

  const [compressedLink,setCompressedLink]=useState('https://icons.iconarchive.com/icons/graphicloads/100-flat-2/256/arrow-upload-icon.png')
  const [originalImage,setOriginalImage]=useState('')
  const [originalLink,setOriginalLink]=useState('')
  const [clicked,setClicked]=useState(false)
  const [uploadImage,setUploadImage]= useState(false)
  const [outputFileName,setOutputFileName]=useState('')
  const [outputFileSize,setOutputFileSize]=useState(0)
 const handle = e => {
    const imageFile = e.target.files[0];
      setOriginalLink(URL.createObjectURL(imageFile))
      setOriginalImage(imageFile)
      setOutputFileName(imageFile.name)
      setUploadImage(true)
  };


 const click = e => {
    e.preventDefault();

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true
    };

    if (options.maxSizeMB >= originalImage.size / 1024) {
      alert("Bring a bigger image");
      return 0;
    }

    let output;
    imageCompression(originalImage, options).then(x => {
      output = x;

      const downloadLink = URL.createObjectURL(output);
        setCompressedLink(downloadLink)
        setOutputFileSize(output.size/1024/1024)
    });

    setClicked(true)
    return 1;
  };

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('LoggedInUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
    }
  }, [])

const handleLogin = async(event) => {
  event.preventDefault()
  try {
    const user = await loginService({
      username, password,
    })
    window.localStorage.setItem(
      'LoggedInUser', JSON.stringify(user)
    )
    setUser(user)
    setUsername('')
    setPassword('')
  } catch (exception) {
    setErrorMessage('Wrong credentials')
    setUsername('')
    setPassword('')
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }
}

const Logout=() => {
  window.localStorage.removeItem('LoggedInUser')
  setUser(null)
}

const loginForm = () => {
  const hideWhenVisible = { display: loginVisible ? 'none' : '' }
  const showWhenVisible = { display: loginVisible ? '' : 'none' }

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={() => {setLoginVisible(true);setSignupVisible(false)}}>log in</button>
      </div>
      <div style={showWhenVisible}>
        <LoginForm
          username={username}
          password={password}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          handleSubmit={handleLogin}
        />
        <button onClick={() => setLoginVisible(false)}>cancel</button>
      </div>
    </div>
  )
}

const handleSignUp=async(event) => {
  event.preventDefault()
  const obj={
    username:username,
    password:password
  }
  const response=await SignUpService(obj)
  setUser(response)
  setUsername('')
  setPassword('')
}

const signUpForm = () => {
  const hideWhenVisible = { display: signUpVisible ? 'none' : '' }
  const showWhenVisible = { display: signUpVisible ? '' : 'none' }
  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={() => {setSignupVisible(true);setLoginVisible(false)}}>Create Account</button>
      </div>
      <div style={showWhenVisible}>
        <SignUpForm
          handleSignUp={handleSignUp}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          username={username}
          password={password}
        />
        <button onClick={() => setSignupVisible(false)}>cancel</button>
      </div>
    </div>
  )
}

if(user===null)
  {
    return(
      <div>
        <h2 align="center">Welcome</h2>
        {loginForm()}
        {signUpForm()}
        <h2><font color="red">{errormessage}</font></h2>
      </div>
    )
  }
  return (

    <div>
      <div align='right'>
          <button onClick={Logout}>Logout</button>
        </div>
          <h1>React Image Compressor</h1>
        <div>
            {uploadImage ? (
              <Card.Img
                src={originalLink}
                width='800px'
                height='500px'
              ></Card.Img>
              
            ) : (
              <Card.Img
                src="https://icons.iconarchive.com/icons/graphicloads/100-flat-2/256/arrow-upload-icon.png"
              ></Card.Img>
            )}
            <br/>
              <input
                type="file"
                accept="image/*"
                onChange={e => handle(e)}
              />
          <p>Original Size:{(originalImage.size / 1024 /1024)} MB</p>
            {outputFileName ? (
              
              <button
                type="button"
                onClick={e => click(e)}
              >
                Compress
              </button>
            ) : (
              <></>
            )}
            {clicked ? (
              <div>
                <br/>
                <Card.Img variant="top" src={compressedLink}></Card.Img>
                <p>Compressed File Size: {outputFileSize} MB</p>
                <a
                  href={compressedLink}
                  download={outputFileName}
                >
                  Download
                </a>
              </div>
            ) : (
              <></>
            )}
        </div>
      </div>
  )
}
export default App;
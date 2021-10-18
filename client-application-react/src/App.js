// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT

import React from 'react'
import { Amplify, Auth } from 'aws-amplify'
import { AmplifyAuthenticator, AmplifySignOut, AmplifySignUp } from '@aws-amplify/ui-react'
import { onAuthUIStateChange } from '@aws-amplify/ui-components'
import awsconfig from './aws-exports'
import axios from 'axios'

const searchParams = new URLSearchParams( window.location.search )
const searchParamsList = {
  regionID:         searchParams.get('stackregion'),
  HttpApiID:        searchParams.get('stackhttpapi'),
  UserPoolID:       searchParams.get('stackuserpool'),
  UserPoolClientID: searchParams.get('stackuserpoolclient'),
}
if( !searchParamsList.regionID.match(/^[a-zA-Z0-9\-]+$/) ){ throw new Error('Invalid Region ID!!'); }
if( !searchParamsList.HttpApiID.match(/^[a-zA-Z0-9\-]+$/) ){ throw new Error('Invalid API ID!!'); }
awsconfig.Auth = {
  region: searchParamsList.regionID,
  userPoolId: searchParamsList.UserPoolID,
  userPoolWebClientId: searchParamsList.UserPoolClientID
}
Amplify.configure(awsconfig)
Auth.configure(awsconfig)

var MyPropsMethods = {}

const App = () => {

  const [acceptState, setAcceptState] = React.useState(false)

  return (
    !acceptState
    ? <div style={{textAlign: 'center', margin: '1em 0 0 0'}}>
        <h2>Only proceed if you opened this link from the CloudFormation Outputs of the stack described in the AWS Blog</h2>
        <button onClick={ e => setAcceptState(true) } style={{fontSize: '1em'}} >Proceed</button>
    </div>
    : <MyAuth />
  )

}

const MyAuth = () => {

  const [authState, setAuthState] = React.useState()
  const [showLogin, setShowLogin] = React.useState(false)
  const goToSignIn = () => setShowLogin(true)
  const exitFromSignIn = () => setShowLogin(false)
  const showAuthenticator = (showLogin || authState == 'signedin')
  const showApp = (!showLogin || authState == 'signedin')
  const showgoToSignIn = !(showLogin || authState == 'signedin') && authState != null

  React.useEffect(() => {
    return onAuthUIStateChange(newAuthState => {
      setAuthState(newAuthState)
      if(newAuthState=='signedin'){
        setShowLogin(false)
      }
    })
  }, [])

  return (
    <div>

      <div style={{
        display: showAuthenticator ? '' : 'none',
        textAlign: 'center'
      }}>
        <div style={{ display: authState != 'signedin' ? '' : 'none', margin: '1em 0' }}>
          <button onClick={exitFromSignIn} style={{fontSize: '1em'}} >Back to the Application!</button>
        </div>
        <AmplifyAuthenticator usernameAlias="email">
          <AmplifySignUp
              slot="sign-up"
              usernameAlias="email"
              formFields={[
                { type: "email", required: true, },
                { type: "password", required: true, },
              ]}
          ></AmplifySignUp>
          <AmplifySignOut />
        </AmplifyAuthenticator>
      </div>

      { showApp &&
        <div style={{ textAlign: 'center', margin: '1em 0 0 0' }}>
          { showgoToSignIn && <button onClick={goToSignIn} style={{fontSize: '1em'}} >Go to Sign In!</button> }
          <ApiForm
            authState={authState}
          />
        </div>
      }

    </div>
  )

}

MyPropsMethods.APIProperties = {
  'foodstore/foods/':['foodId'],
  'petstore/pets/':['petId'],
}

const ApiForm = (props) => {

  const [selectedMethod, setSelectedMethod] = React.useState()
  const [selectedAPI, setSelectedAPI] = React.useState()
  const [selectedVariable, setSelectedVariable] = React.useState()
  const [selectedPayload, setSelectedPayload] = React.useState()

  const handleMethodChange = (e) => setSelectedMethod(e.target.value)
  const handleAPIChange = (e) => setSelectedAPI(e.target.value)
  const handleVariableChange = (e) => setSelectedVariable(e.target.value)
  const handlePayloadChange = (e) => setSelectedPayload( selectedMethod == 'GET' ? undefined : e.target.value )

  const pathVariable = selectedAPI ? MyPropsMethods.APIProperties[selectedAPI][0] : ''

  const enableFormSubmission = !!( selectedMethod && selectedAPI && selectedVariable && ( selectedMethod == 'GET' || selectedPayload ) )

  return (
    <div style={{ margin: '1em 0 0 0' }}>
      <form onSubmit={ (e) => MyPropsMethods.invokeAPI(e,enableFormSubmission, selectedMethod, selectedAPI, selectedVariable, selectedPayload, props.authState) }>
        <h2>
            { props.authState == 'signedin'
              ? <span>Looks like you're <u style={{color:"#00bb00"}}>signed in!</u></span>
              : <span>Looks like you're <u style={{color:"red"}}>NOT signed in</u></span>
            }
        </h2>
        <h3>
            { props.authState == 'signedin'
              ? <span>You should be able to invoke <span style={{color:"#00bb00"}}>GET</span> and also <span style={{color:"#00bb00"}}>PUT</span>. Try it out!</span>
              : <span>You should be able to invoke <span style={{color:"#00bb00"}}>GET</span> but not <span style={{color:"red"}}>PUT</span>. Try it out!</span>
            }
        </h3>
        <br />
        <div>
            <b>Method:</b>
            <div onChange={handleMethodChange}>
              <input type="radio" value="PUT" name="method" id="PUT"/>
              <label htmlFor="PUT"> PUT</label><br />
              <input type="radio" value="GET" name="method" id="GET"/>
              <label htmlFor="GET"> GET</label><br />
            </div>
        </div>
        <br />
        <div>
            <b>API:</b>
            <div onChange={handleAPIChange}>
              <input type="radio" value="foodstore/foods/" name="api" id="foodstore/foods/"/>
              <label htmlFor="foodstore/foods/"> /foodstore/foods/{'{foodId}'}</label><br />
              <input type="radio" value="petstore/pets/" name="api" id="petstore/pets/"/>
              <label htmlFor="petstore/pets/"> /petstore/pets/{'{petId}'}</label><br />
            </div>
        </div>
        <br />
        <div style={{ display: selectedAPI ? '' : 'none' }}>
            <b id="path-variable-label">{'{'+pathVariable+'}'}:</b><br />
            <input type="text" name="variable" style={{fontSize: '1em'}} onChange={handleVariableChange}/>
        </div>
        <br />
        <div style={{ display: selectedMethod=='PUT' ? '' : 'none' }} >
            <b id="path-variable-label">Body (JSON):</b><br />
            <textarea name="payload" rows="10" style={{fontSize: '1em', maxWidth: '90%', width: '500px'}} onChange={handlePayloadChange}/>
        </div>
        <br />

        <input type="submit" value="Invoke!" style={{ fontSize: '1em' }} />

      </form>
    </div>
  )

}

MyPropsMethods.invokeAPI = ( e, enableFormSubmission, selectedMethod, selectedAPI, selectedVariable, selectedPayload, authState ) => {

  e.preventDefault()
  if( !enableFormSubmission ) return alert("Error: All fields are mandatory.")

  if( authState == 'signedin' ){
    Auth.currentSession().then( tokens => {
          MyPropsMethods.AjaxCall( selectedMethod, selectedAPI, selectedVariable, selectedPayload, tokens.accessToken.jwtToken )
    })
  } else{
          MyPropsMethods.AjaxCall( selectedMethod, selectedAPI, selectedVariable, selectedPayload )
  }

}

MyPropsMethods.AjaxCall = ( selectedMethod, selectedAPI, selectedVariable, selectedPayload, jwtToken ) => {

  const invokeURL = `https://${searchParamsList.HttpApiID}.execute-api.${searchParamsList.regionID}.amazonaws.com/${selectedAPI}${selectedVariable}`
  const reqHeaders = jwtToken ? { authorization: jwtToken } : undefined

  try {
    selectedPayload = selectedPayload ? JSON.parse(selectedPayload): selectedPayload
    if (Object.prototype.toString.call(selectedPayload) === '[object Array]') throw new Error();
  } catch (e) {
      return alert("Error: Body is NOT a valid JSON.");
  }

  axios({
    method: selectedMethod,
    url: invokeURL,
    data: selectedPayload,
    headers: reqHeaders
  })
  .then( response => {
    alert(JSON.stringify(response.data))
  }).catch( error => {
    alert( error )
  })

}

export default App
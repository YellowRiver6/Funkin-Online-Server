function Home() {
    return (
        <div className='Content'>
            <div className="Main">
                <img className="CumImage" alt='Psych Online' src='/images/transwag.png'></img> <br />
                <p>Psych Online is a Friday Night Funkin' Multiplayer mod based on Psych Engine!</p>
                <img className="CumBigImage" alt='' src='/images/onlinePreview.gif'></img> <br />
                <h2 >Downloads</h2> <br/>
                <div className="Downloads">
                    <a href='https://links.8uid.com/d/111b237ce48ec6b571ce3525df221e9b'>
                        <img alt="Windows" width={150} src='/images/windows_logo.png'></img>
                        <p>Windows</p>
                    </a>
                    <a href='https://links.8uid.com/d/7888526345a01f384eecf46c9bb5e331'>
                        <img alt="Linux" width={150} src='/images/linux_logo.png'></img>
                        <p>Linux</p>
                    </a>
                    <a href='https://links.8uid.com/d/918efbaa6a42e7b7a396194320522278'>
                        <img alt="MacOS" width={150} src='/images/apfel_logo.png'></img>
                        <p>MacOS</p>
                    </a>
                </div>
                <br></br>
                <a style={{color: 'yellow'}} href='/rules'> 玩之前请务必点这里查看规则! </a>
                <br></br>
                <span className="BigText" >Mobile Ports</span> <br />
                <div className="Downloads">
                    <a href='https://links.8uid.com/d/b68773fc5a4f6933376d826d8a696810'>
                        <img alt="Android" width={150} src='/images/android_logo.png'></img>
                        <p>Android</p>
                    </a>
                    <a href='https://links.8uid.com/d/a4b8ef998718442f7453e9f986651f32'>
                        <img alt="iOS" width={150} src='/images/apfel_logo.png'></img>
                        <p>iOS</p>
                    </a>
                </div>
                <br></br>
                <br></br>
                <span className="BigText" >汉化版引擎</span> <br />
                <a style={{color: 'red'}} > 使用汉化版引擎造成的闪退和报错等后果自负, 出现的问题不予解释与解决 </a>
                <div className="Downloads">
                    <a href='https://links.8uid.com/d/85738754481297ee986fdce9dd54de06'>
                        <img alt="Windows" width={150} src='/images/windows_logo.png'></img>
                        <p>汉化Windows</p>
                    </a>
                    <a href='https://links.8uid.com/d/f1cce345565e891d72949134b9bf1dc4'>
                        <img alt="Linux" width={150} src='/images/linux_logo.png'></img>
                        <p>汉化Linux</p>
                    </a>
                    <a href='https://links.8uid.com/d/4bb6c53b26e511a3c74bd357497c940b'>
                        <img alt="Android" width={150} src='/images/android_logo.png'></img>
                        <p>汉化Android(PXO)</p>
                    </a>
                </div>
                <br></br>
                <h3> Also check out the GameBanana page!</h3>
                <a href="https://gamebanana.com/mods/479714"><img className="CumBigImage" alt='' src="https://gamebanana.com/mods/embeddables/479714?type=sd_image" /></a>
                <br></br>
                <h5> Psych Online is a fan project not affiliated with the Psych Engine Team or Funkin' Crew  </h5>
            </div>
        </div>
    );
}

export default Home;
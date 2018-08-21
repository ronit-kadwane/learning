# Create Android UI Components for React Native.

Once you install React Native, it provides you a lot of built-in components, **View** is the most fundamental component you can use, and there are others available to build your UI like Text, Image, and some basic others. 

Native views are created and manipulated by extending  `ViewManager` or more commonly `SimpleViewManager`. A SimpleViewManager is convenient in this case because it applies common properties such as background color, opacity, and Flexbox layout.

These subclasses are essentially singletons - only one instance of each is created by the bridge. They vend native views to the `NativeViewHierarchyManager`, which delegates back to them to set and update the properties of the views as necessary. The `ViewManagers` are also typically the delegates for the views, sending events back to JavaScript via the bridge.

Let’s suppose you want to create an app which includes `Brightcove video player`.

- ## Implement custom ViewManager  
`BrightcovePlayerView.java`
```
public class BrightcovePlayerView extends RelativeLayout {
  ...
  //initialize player view
   public BrightcovePlayerView(final ThemedReactContext context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        this.setBackgroundColor(Color.BLACK);
        this.playerVideoView = new BrightcoveExoPlayerVideoView(this.context);
        this.addView(this.playerVideoView);
        this.playerVideoView.setLayoutParams(new RelativeLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
        this.playerVideoView.finishInitialization();
        this.mediaController = new BrightcoveMediaController(this.playerVideoView);
        this.playerVideoView.setMediaController(this.mediaController);
        this.requestLayout();
        ViewCompat.setTranslationZ(this, 9999);

        // require accountId, policyKey and videoId
        this.catalog = new Catalog(this.playerVideoView.getEventEmitter(), this.accountId, this.policyKey);
        VideoListener listener = new VideoListener() {
            @Override
            public void onVideo(Video video) {
                BrightcovePlayerView.this.playerVideoView.clear();
                BrightcovePlayerView.this.playerVideoView.add(video);
                    BrightcovePlayerView.this.playerVideoView.start();
            }
        };
        this.catalog.findVideoByID(this.videoId, listener);  
   }
}
```

The code looks quite straightforward. BrightcovePlayerView requires accountId, policyKey and videoId to a video stream and instance of MediaController.

- ## Create the ViewManager subclass
Let’s start with declaring our own custom ViewManager   
`BrightcovePlayerManager.java` 

```
...
public class BrightcovePlayerManager extends SimpleViewManager<BrightcovePlayerView> {

  public static final String REACT_CLASS = "BrightcovePlayer";

  @Override
  public String getName() {
    return REACT_CLASS;
  }
```

- ## Expose view property setters using @ReactProp  
Properties that are to be reflected in JavaScript needs to be exposed as setter method annotated with `@ReactProp`. Setter should be declared as a void method and should be public.

expose accountId, policyKey and videoId setter using ReactProp:

```
@ReactProp(name = "policyKey")
    public void setPolicyKey(BrightcovePlayerView view, String policyKey) {
        //handle method in BrightcoveplayerView
        view.setPolicyKey(policyKey);
    }

    @ReactProp(name = "accountId")
    public void setAccountId(BrightcovePlayerView view, String accountId) {
        //handle method in BrightcoveplayerView
        view.setAccountId(accountId);
    }

    @ReactProp(name = "videoId")
    public void setVideoId(BrightcovePlayerView view, String videoId) {
        //handle method in BrightcoveplayerView
        view.setVideoId(videoId);
    }
```
add createViewInstance implementation:
```
 @Override
    public BrightcovePlayerView createViewInstance(ThemedReactContext ctx) {
        context = ctx;
        BrightcovePlayerView brightcovePlayerView = new BrightcovePlayerView(ctx);
        return brightcovePlayerView;
    }
```
One note about the code. Because LibsChecker requires an instance of Activity we will receive it via constructor, it will reference root activity used for RN application.

- ## Register the ViewManager
The final Java step is to register the ViewManager to the application, this happens in a similar way to Native Modules, via the applications package member function createViewManagers.
`BrightcovePlayerPackage.java` 
```
public class BrightcovePlayerPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactApplicationContext) {
        List<NativeModule> modules = new ArrayList<>();
        return modules;
    }

    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Arrays.<ViewManager>asList(
                new BrightcovePlayerManager()  //register here
        );
    }
}
```

- ## Implement the JavaScript module

The very final step is to create the JavaScript module that defines the interface layer between Java and JavaScript for the users of your new view. Much of the effort is handled by internal React code in Java and JavaScript and all that is left for you is to describe the `propTypes`.

In order to expose custom UI component in JavaScript it is necessary to call special requireNativeComponent function:  
`index.js`
```
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {View, requireNativeComponent, ViewPropTypes} from 'react-native';

BrightcovePlayer.propTypes = {
  ...(ViewPropTypes || View.propTypes),
  policyKey: PropTypes.string,
  accountId: PropTypes.string,
  videoId: PropTypes.string
};

BrightcovePlayer.defaultProps = {};

const NativeBrightcovePlayer = requireNativeComponent(
  'BrightcovePlayer',
  BrightcovePlayer
);

module.exports = BrightcovePlayer;
```
`requireNativeComponent` commonly takes two parameters, the first is the name of the native view and the second is an object that describes the component interface.

- ## Custom events from native

So now we know how to expose native view components that we can control easily from JS, but how do we deal with events from the user. To handle user's action we need to create event from native and it will handle in js.

create event from native   
`BrightcovePlayerView.java`
```
        EventEmitter eventEmitter = this.playerVideoView.getEventEmitter();
        eventEmitter.on(EventType.DID_PLAY, new EventListener() {
            @Override
            public void processEvent(Event e) {
                BrightcovePlayerView.this.playing = true;
                WritableMap event = Arguments.createMap();
                ReactContext reactContext = (ReactContext) BrightcovePlayerView.this.getContext();
                reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(BrightcovePlayerView.this.getId(), "onPlay", event);
            }
        });
        eventEmitter.on(EventType.DID_PAUSE, new EventListener() {
            @Override
            public void processEvent(Event e) {
                BrightcovePlayerView.this.playing = false;
                WritableMap event = Arguments.createMap();
                ReactContext reactContext = (ReactContext) BrightcovePlayerView.this.getContext();
                reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(BrightcovePlayerView.this.getId(), "onPause", event);
            }
        });
```
To map the topChange event name to the onPlay and onPause callback prop in JavaScript, register it by overriding the `getExportedCustomBubblingEventTypeConstants` method in your `ViewManager`:
```
public class BrightcovePlayerManager extends SimpleViewManager<BrightcovePlayerView> {
...
 @Override
    public @Nullable Map <String,Object> getExportedCustomDirectEventTypeConstants() {
        Map<String, Object> map = new HashMap<>();
        map.put("onPlay", (Object) MapBuilder.of("registrationName", "onPlay"));
        map.put("onPause", (Object) MapBuilder.of("registrationName", "onPause"));
        return map;
    }
}
```

This callback is invoked with the raw event, which we typically process in the wrapper component to make a simpler API:  
`index.js`
```
class BrightcovePlayer extends Component {
  setNativeProps = nativeProps => {
    if (this._root) {
      this._root.setNativeProps(nativeProps);
    }
  };

  render() {
    return (
      <NativeBrightcovePlayer
        ref={e => (this._root = e)}
        {...this.props}
        onPlay={event =>
          this.props.onPlay && this.props.onPlay(event.nativeEvent)
        }
        onPause={event =>
          this.props.onPause && this.props.onPause(event.nativeEvent)
        }
    );
  }
}
BrightcovePlayer.propTypes = {
  ...(ViewPropTypes || View.propTypes),
  onPlay: PropTypes.func,
  onPause: PropTypes.func
};
```
- ## Usage

Now, we can use Brightcove player as a react component in react native 
for example,
```
<BrightcovePlayer
    style={styles.player}
    accountId={accountId}
    videoId={videoId}
    policyKey={policyKey}
    onPlay={() => {
        console.log('onPlay');
    }}
    onPause={() => {
        console.log('onPause');
    }}
/>
```

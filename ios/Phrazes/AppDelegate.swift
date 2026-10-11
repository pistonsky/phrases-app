import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FBSDKCoreKit
import RNBootSplash

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // The Facebook SDK no longer initializes itself
    ApplicationDelegate.shared.application(application, didFinishLaunchingWithOptions: launchOptions)

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    return true
  }
}

// Apps built with the iOS 27 SDK must adopt the UIScene life cycle, so the window
// (and React Native in it) is set up per scene rather than in the app delegate
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }

    window = UIWindow(windowScene: windowScene)

    appDelegate.reactNativeFactory?.startReactNative(
      withModuleName: "phrazes60",
      in: window,
      launchOptions: nil
    )

    // a URL that launched the app is only delivered here
    openURL(connectionOptions.urlContexts.first)
  }

  // with scenes, URLs (like the Facebook login callback) arrive here instead of application(_:open:options:)
  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    openURL(URLContexts.first)
  }

  private func openURL(_ context: UIOpenURLContext?) {
    guard let context = context else { return }
    _ = ApplicationDelegate.shared.application(
      UIApplication.shared,
      open: context.url,
      sourceApplication: context.options.sourceApplication,
      annotation: context.options.annotation
    )
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    // keep the splash screen up until JS calls BootSplash.hide()
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }
}

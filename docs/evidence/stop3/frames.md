19f9f2e3b7c35affab107ef4e9b2471dd46462ac

`frames.json` is the 4× CPU long-animation-frame log for the quiet load and the early scroll, desktop and phone. `frameworkShare` is framework script time divided by all script time. A frame is excluded when that share is at least 0.8.

Quiet desktop, after first paint: one scriptless frame of 60 ms at 1,269 ms. Our script time in it is 0. The framework evaluation (114 ms, share 1) is excluded. Quiet phone: the only long frame is the framework runtime before first paint.

Early scroll starts at 339 ms on desktop and 375 ms on the phone. No long frame in either trace attributes script time to our files.

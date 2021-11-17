# Automatically creates and updates symlinks from sources to destinations

1) create a config file from model `conf.dist.json` and put it wherever you'd like
2) update `systemd/symlinks_watcher.service`:
    - use your main user instead of `nobody` (use a user that has permissions to the folders you ant to watch)
    - set `/path/to/node/bin`
    - set `/path/to/bin/watch_folder`
3) copy `systemd/symlinks_watcher.service` to `/etc/systemd/system/`
4) activate the service running `sudo systemctl activate symlinks_watcher.service`
4) start the service running `sudo systemctl start symlinks_watcher.service`
import React, { useEffect, useState } from "react";
import userStore from "part:@sanity/base/user";
import { Dialog, Box, Text, Button, Stack } from "@sanity/ui";

const IdleDetectorComponent = () => {
  const [allowed, setAllowed] = useState(true);
  const [needPermission, setNeedPermission] = useState(false);

  const startMonitoring = async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    const idleDetector = new IdleDetector();
    idleDetector.addEventListener("change", () => {
      const userState = idleDetector.userState;
      const screenState = idleDetector.screenState;
      if (screenState === "locked" || userState === 'idle') {
        userStore.actions.logout();
      }
    });

    await idleDetector.start({
      threshold: 60_000,
      signal,
    });
  };

  useEffect(() => {
    if (allowed) {
      setNeedPermission(false)
      startMonitoring().catch(() => {
        // Error occurred, most likely need to ask permission
        setAllowed(false)
        setNeedPermission(true)
      })
    }
  }, [allowed]);

  const askPermission = async () => {
    const result = await IdleDetector.requestPermission()
    setAllowed(result === 'granted')
  };

  if (!needPermission) return null

  return (
    <Dialog
      header="Idle detection"
      id="dialog-example"
      onClose={() => {}}
      zOffset={1000}
    >
      <Box padding={4}>
          <Stack space={4}>
          <Text>This web application needs your permission to moinitor your active/idle state.</Text>
          <Button tone="primary" onClick={askPermission} text="Request permission"/>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default IdleDetectorComponent
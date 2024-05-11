import * as _ from 'lodash'

import { DisplayText, Flex, Tabs } from '@contentful/f36-components';
import React, { useCallback, useEffect, useState } from 'react';

import { ConfigAppSDK } from '@contentful/app-sdk';
import { css } from 'emotion';
import { useSDK } from '@contentful/react-apps-toolkit';
import { TagProps } from 'contentful-management/types';
import { AppInstallationParameters } from '../types';
import { ValueTagMapping } from '../components';

const ConfigScreen = () => {
  const initParameters: AppInstallationParameters = {
    ValueTagMapping: {

    },
    ValueToValueMapping: {

    }
  }
  const [parameters, setParameters] = useState<AppInstallationParameters>(initParameters);
  const sdk = useSDK<ConfigAppSDK>();
  const cma = sdk.cma;
  const currentEnvironment = sdk.ids.environmentAlias ?? sdk.ids.environment
  const [spaceId, setSpaceId] = useState<string | undefined>()
  const [brandTags, setBrandTags] = useState<TagProps[]>()
  const [productTags, setProductTags] = useState<TagProps[]>()

  useEffect(() => {
    (async () => {
      // Get current space
      const currentSpace = await cma.space.get({})

      if (currentSpace) {
        setSpaceId(currentSpace.sys.id);
      }
    })();

  }, [cma.space])

  useEffect(() => {
    if (!_.isUndefined(spaceId)) {
      const getBrandAndProductTags = async () => {
        const tags = await cma.tag.getMany({
          spaceId: spaceId,
          environmentId: currentEnvironment
        })

        if (tags) {
          const _productTags = tags.items.filter(item => item.name.toLowerCase().startsWith('product:'))
          const _brandTags = tags.items.filter(item => item.name.toLowerCase().startsWith('brand:'))
          setBrandTags(_brandTags)
          setProductTags(_productTags)
        }
      }
      getBrandAndProductTags();
    }
  }, [cma.tag, currentEnvironment, spaceId])

  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();

  const onConfigure = useCallback(async () => {
    // This method will be called when a user clicks on "Install"
    // or "Save" in the configuration screen.
    // for more details see https://www.contentful.com/developers/docs/extensibility/ui-extensions/sdk-reference/#register-an-app-configuration-hook

    // Get current the state of EditorInterface and other entities
    // related to this app installation
    const currentState = await sdk.app.getCurrentState();

    return {
      // Parameters to be persisted as the app configuration.
      parameters,
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: currentState,
    };
  }, [parameters, sdk]);

  useEffect(() => {
    // `onConfigure` allows to configure a callback to be
    // invoked when a user attempts to install the app or update
    // its configuration.
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      // Get current parameters of the app.
      // If the app is not installed yet, `parameters` will be `null`.
      const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
      }

      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      sdk.app.setReady();
    })();
  }, [sdk]);

  return (
    <Flex flexDirection="column" className={css({ margin: '80px' })} gap="spacingS">
      <DisplayText>Those settings are applied to: {currentEnvironment.toLowerCase() === 'master' ? 'PRODUCTION' : currentEnvironment.toUpperCase()} environment</DisplayText>

      <Tabs defaultTab="valueTagMapping">
        <Tabs.List>
          <Tabs.Tab panelId="valueTagMapping">Remote URL for Brand-Product tags </Tabs.Tab>
          <Tabs.Tab panelId="valueToValueMapping">Mapping Values</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="valueTagMapping">
          <ValueTagMapping brandTags={brandTags} productTags={productTags} parameters={parameters} setParameters={setParameters} />
        </Tabs.Panel>

        <Tabs.Panel id="valueToValueMapping">
          <Flex flexDirection="column" marginTop="spacingM" gap="spacingS">
          </Flex>
          </Tabs.Panel>
      </Tabs>


    </Flex>
  );
};

export default ConfigScreen;

import React, { useEffect, useState } from 'react';
import { TextInput, Flex, Box, Select } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import { IAppInstallationParameters, IRemotedAppUrl } from '../types';
import _ from 'lodash';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const cma = sdk.cma;
  const fieldLocale = sdk.field.locale;
  const installationParameters = sdk.parameters.installation as IAppInstallationParameters; // From App Config (ConfigScreen)
  const instanceParameters = sdk.parameters.instance; // From App Definition
  const appendValueFromParam = instanceParameters?.appendValueFrom ?? undefined;
  // useStates
  const [dependFieldValue, setDependFieldValue] = useState<string>('')
  const [currentSelection, setCurrentSelection] = useState<string>('')
  const [fieldValue, setFieldValue] = useState(sdk.field.getValue());
  const [selectionData, setSelectionData] = useState<IRemotedAppUrl[]>([]);
  const [shouldRenderSelection, setShouldRenderSelection] = useState<boolean>(false);

  // consts
  const hasDependField: boolean = !_.isUndefined(appendValueFromParam) && _.has(sdk.entry.fields, appendValueFromParam)
  const addLastSlash = (url: string) => !url.endsWith('/') ? `${url}/` : url

  useEffect(() => {
    sdk.window.startAutoResizer()
  }, [sdk.window])

  useEffect(() => {
    sdk.field.setValue(fieldValue)
  }, [fieldValue, sdk.field])

  useEffect(() => {
    const entryTags = sdk.entry.getMetadata()?.tags;
    const _currentEntryBrandTags = entryTags?.filter(item => item.sys.id.toLowerCase().startsWith('brand')).map(item => item.sys.id) ?? [];
    const _currentEntryProductTags = entryTags?.filter(item => item.sys.id.toLowerCase().startsWith('product')).map(item => item.sys.id) ?? [];
    const _shouldRenderSelection = !(_currentEntryBrandTags?.length === 1 && _currentEntryProductTags?.length === 1)
    const _selectionData = [] as IRemotedAppUrl[];


    setShouldRenderSelection(_shouldRenderSelection);

    const valueTagMappingParams = installationParameters.ValueTagMapping;

    if (_shouldRenderSelection) {
      for (const [key, value] of Object.entries(valueTagMappingParams)) {
        if (_currentEntryBrandTags.includes(value.brand) || _currentEntryProductTags.includes(value.product)) {
          _selectionData.push(
            value
          )
        }
      }
    } else {
      _selectionData.push(
        valueTagMappingParams[`${_currentEntryBrandTags[0]}-${_currentEntryProductTags[0]}`]
      )
    }

    if (!_shouldRenderSelection) {
      const val = `${addLastSlash(_selectionData[0].url)}${dependFieldValue}`
      setCurrentSelection(_selectionData[0].url)
      setFieldValue(val)
    } else {
      setCurrentSelection('')
    }

    setSelectionData(
      _selectionData.filter(item => item.url !== '')
    )

  }, [dependFieldValue, hasDependField, installationParameters.ValueTagMapping, sdk.entry])

  /*
    if appendValueFromParam is not undefined
    get value from field[appendValueFromParam]
    defined onChangeHandler
  */
    useEffect(() => {
      if (hasDependField) {
        const onDependFieldChanged = () => {
          const _dependFieldValue = sdk.entry.fields[appendValueFromParam].getValue()
          const valueMappings = installationParameters.ValueToValueMapping
          if (_.has(valueMappings, _dependFieldValue)) {
            setDependFieldValue(valueMappings[_dependFieldValue])

            if (currentSelection !== '') {
              const val = `${addLastSlash(currentSelection)}${valueMappings[_dependFieldValue]}`
              setFieldValue(val)
            }
          }
        }

        sdk.entry.fields[appendValueFromParam].onValueChanged(onDependFieldChanged)
      }
    }, [appendValueFromParam, currentSelection, hasDependField, installationParameters.ValueToValueMapping, sdk.entry.fields])

  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();
  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/

  const onSelectionChanged = (event) => {
    // get the changed value and append to the field value
    const selectedValue = event.target.value
    const val = `${addLastSlash(selectedValue)}${dependFieldValue}`
    setFieldValue(val)
    setCurrentSelection(selectedValue)
  }

  if (shouldRenderSelection) {
    return (
      <>
            <Flex flexDirection="row" gap="spacingS">
              <Flex
                flexGrow={1}
              >
                <TextInput value = { fieldValue } onChange = {(e) => setFieldValue(e.target.value)} />
              </Flex>
              <Box>
                <Select
                  onChange={onSelectionChanged}
                >
                  {
                    selectionData.map((item, index) => {
                      return <Select.Option key={item.id} value={item.url}>{item.url}</Select.Option>
                    })
                  }
                </Select>
              </Box>
            </Flex>
          </>
    )
  }

  return (<TextInput value = { fieldValue } onChange = {(e) => setFieldValue(e.target.value)} />)
};

export default Field;

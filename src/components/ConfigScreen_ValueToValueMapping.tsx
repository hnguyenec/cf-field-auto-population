import { Flex, Form, IconButton, Heading, Text, Table, TextInput } from '@contentful/f36-components';
import React, { useCallback, useEffect, useState } from 'react';
import { AppInstallationParameters } from '../types';
import _ from 'lodash';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { PlusCircleIcon, ErrorCircleOutlineIcon, DeleteIcon } from '@contentful/f36-icons';

interface IValueToValueMappingProps {
  parameters: AppInstallationParameters
  setParameters: React.Dispatch<React.SetStateAction<AppInstallationParameters>>
}

const styles = {
  greyContainer: css({
    backgroundColor: tokens.gray200,
    borderRadius: tokens.borderRadiusMedium,
  }),
};

type TState = {
  fromValue: string,
  toValue: string
}

export const ValueToValueMapping = ({ parameters, setParameters }: IValueToValueMappingProps) => {
  const [valueMappings, setValueMappings] = useState<TState[]>([])

  useEffect(() => {
    const fromMappings = _.keys(parameters.ValueToValueMapping)
    const mappingList = fromMappings.map(fromValue => {
      return {
        fromValue: fromValue,
        toValue: parameters.ValueToValueMapping[fromValue]
      }
    })
    setValueMappings(mappingList)

  }, [parameters.ValueToValueMapping])


  const onValueMappingChanged = (value: { fromValue: string, toValue: string }) => {
    setParameters({
      ...parameters,
      ValueToValueMapping: {
        ...parameters.ValueToValueMapping,
        [value.fromValue]: value.toValue
      }
    })
  }

  const handleAdd = () => {

    setValueMappings([
      ...valueMappings,
      { fromValue: '', toValue: '' }
    ])
  }

  const handleDelete = (index: number) => {
    const newList = [...valueMappings];
    newList.splice(index, 1)
    setValueMappings(newList)
  }

  return (
    <Flex flexDirection="column" marginTop="spacingM" gap="spacingS">

      <Form>
        <Heading>Mapping Values</Heading>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>From</Table.Cell>
              <Table.Cell>To</Table.Cell>
              <Table.Cell>Error</Table.Cell>
              <Table.Cell>Action</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {
              valueMappings?.map((item, index) => (
                <FromToComponent mappingList={parameters.ValueToValueMapping} data={item} onValueChanged={onValueMappingChanged} index={index} handleDelete={handleDelete}></FromToComponent>
              ))
            }
          </Table.Body>
        </Table>

      </Form>

      <Flex flexDirection="column" gap="spacingS" alignItems="center" className={styles.greyContainer} padding="spacingS">
        <IconButton
          variant="secondary"
          aria-label="Add value to value mapping"
          icon={<PlusCircleIcon />}
          onClick={handleAdd}
        >Add more</IconButton>
      </Flex>
    </Flex>
  )
}

interface IFromToComponentProps {
  mappingList: {
    [source: string]: string
  }
  data: TState
  onValueChanged: any
  handleDelete: any
  index: number
}

const FromToComponent = ({ mappingList, data, onValueChanged, handleDelete, index }: IFromToComponentProps) => {
  const [value, setValue] = useState(data)
  const [error, setError] = useState<boolean | undefined>()

  const onChange = (newValue: TState) => {
    setValue(newValue)
    if (_.isNil(newValue.fromValue) || _.isNil(newValue.toValue) || _.isEmpty(newValue.fromValue) || _.isEmpty(newValue.toValue) ||  _.has(mappingList, newValue.fromValue)) {
      setError(true)
    } else {
      setError(false)
    }
  }

  const triggerOnValueChanged = (event) => {
    if (error === false) {
      onValueChanged(value)
    }
  }

  return (
    <Table.Row key={`row-${index}`}>
      <Table.Cell>
        <TextInput
          value={value.fromValue}
          onChange={(e) => onChange({ fromValue: e.target.value, toValue: value.toValue })}
          onBlur={triggerOnValueChanged}
        />
      </Table.Cell>
      <Table.Cell>
        <TextInput
          value={value.toValue}
          onChange={(e) => onChange({ fromValue: value.fromValue, toValue: e.target.value })}
          onBlur={triggerOnValueChanged}
        />
      </Table.Cell>
      <Table.Cell>
        {
          error && (
            <Flex alignItems="center" gap="spacingXs">
              <ErrorCircleOutlineIcon size="medium" /> <Text>Invalid data</Text>
            </Flex>
          )
        }
      </Table.Cell>
      <Table.Cell>

        <Flex alignItems="center">
        <IconButton
          variant="secondary"
          aria-label="Delete mapping"
          icon={<DeleteIcon />}
          onClick={() => handleDelete(index)}
        >Delete</IconButton>

        </Flex>
      </Table.Cell>
    </Table.Row>
  )
}
import { DisplayText, Flex, Form, FormControl, Heading, Note, Paragraph, Table, TextInput } from '@contentful/f36-components';
import { TagProps } from 'contentful-management/types';
import React, { useCallback, useEffect, useState } from 'react';
import { AppInstallationParameters, IRemotedAppUrl } from '../types';
import _ from 'lodash';

interface IValueTagMappingProps {
  brandTags: TagProps[] | undefined
  productTags: TagProps[]  | undefined
  parameters: AppInstallationParameters
  setParameters: React.Dispatch<React.SetStateAction<AppInstallationParameters>>
}

export const ValueTagMapping = ({ brandTags, productTags, parameters, setParameters }: IValueTagMappingProps) => {

  const onUrlInputChanged = (event: { target: any; }) => {
    const target = event.target;

    const formItems: IRemotedAppUrl = {
      id: target.id,
      url: target.value,
      brand: target.id.split('-')[0],
      product: target.id.split('-')[1]
    }

    setParameters({
      ...parameters,
      ValueTagMapping: {
        ...parameters.ValueTagMapping,
        [target.id]: formItems
      }
    })
  }

  const getDefaultValue = (brandId: string, productId: string) => {
    const id = `${brandId}-${productId}`
    if (_.has(parameters.ValueTagMapping, id)) {
      return parameters.ValueTagMapping[id].url
    }

    return ''
  }

  return (
    <Flex flexDirection="column" marginTop="spacingM" gap="spacingS">
      <Note variant="warning" title="This app requires the tags to be created in the space. The tags should be named as follows:">
        <Paragraph>
          <b>Brand:</b> Brand:brand-name
        </Paragraph>
        <Paragraph>
          <b>Product:</b> Product:product-name
        </Paragraph>
      </Note>
      <Form>
        <Heading>Remoted App URL Config</Heading>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>URL</Table.Cell>
              <Table.Cell>Brand</Table.Cell>
              <Table.Cell>Product</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {
              brandTags?.map(brand => {
                return (
                  productTags?.map(product => {
                    return (
                      <Table.Row key={brand.sys.id + product.sys.id}>
                        <Table.Cell>
                          <FormControl>
                            <TextInput
                              value={getDefaultValue(brand.sys.id, product.sys.id)}
                              name={`${brand.sys.id}-${product.sys.id}`} id={`${brand.sys.id}-${product.sys.id}`}
                              onChange={onUrlInputChanged} />
                            <FormControl.HelpText>Enter the remoted app url for each Brand and Product</FormControl.HelpText>
                          </FormControl>
                        </Table.Cell>
                        <Table.Cell>
                          <DisplayText>{brand.name.replace('Brand:', '')}</DisplayText>
                        </Table.Cell>
                        <Table.Cell>
                          <DisplayText>{product.name.replace('Product:', '')}</DisplayText>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })
                )
              })
            }
          </Table.Body>
        </Table>

      </Form>
    </Flex>
  )
}
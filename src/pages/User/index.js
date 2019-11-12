import React, { Component } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loader,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    refreshing: false,
    page: 2,
  };

  componentDidMount() {
    this.setState({ loading: true }, this.getData);
  }

  getData = async () => {
    const { navigation } = this.props;
    const { page, stars, refreshing } = this.state;

    const user = navigation.getParam('user');
    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        per_page: 10,
        page,
      },
    });

    this.setState({
      stars: refreshing ? response.data : [...stars, ...response.data],
      loading: false,
      refreshing: false,
    });
  };

  loadMore = () => {
    const { page } = this.state;
    this.setState({ page: page + 1, loading: true }, this.getData);
  };

  footerLoader = () => {
    const { loading } = this.state;
    return (
      loading && (
        <Loader>
          <ActivityIndicator size="large" />
        </Loader>
      )
    );
  };

  emptyStars = () => {
    return <Text>Nenhum star encontrado</Text>;
  };

  refreshList = () => {
    this.setState(
      {
        page: 1,
        refreshing: true,
      },
      this.getData
    );
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading && <ActivityIndicator />}

        <Stars
          data={stars}
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) => (
            <Starred onPress={() => this.handleNavigate(item)}>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
          onEndReached={this.loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={this.footerLoader}
          ListEmptyComponent={this.emptyStars}
          refreshing={refreshing}
          onRefresh={this.refreshList}
        />
      </Container>
    );
  }
}

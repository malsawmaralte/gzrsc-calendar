import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logout} from '../actions';
import {connect} from 'react-redux';
import api from '../api/api';
import TextInputStyle from '../components/TextInputStyle';
import {Picker} from '@react-native-picker/picker';
import Barcode from 'react-native-barcode-builder';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import getColor from '../components/getColor';

const UserList = ({logout, course}) => {
  const [selectCourse, setSelectCourse] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (selectCourse) fetchData();
    else setData([]);
  }, [selectCourse]);

  const fetchData = async () => {
    let token;
    if (await AsyncStorage.getItem('admin-auth'))
      token = await AsyncStorage.getItem('admin-auth');
    else if (await AsyncStorage.getItem('teacher-auth'))
      token = await AsyncStorage.getItem('teacher-auth');
    else token = null;
    if (token) {
      try {
        const response = await api.get(
          `/api/malsawma/student/${selectCourse}`,
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          },
        );
        setData(response.data.data);
      } catch (error) {
        setData([]);
      }
    } else {
      return logout();
    }
  };

  const renderData = () => {
    if (data.length) {
      return data.map((item, index) => {
        return (
          <View
            key={item.id}
            style={{
              flex: 1,
              padding: 8,
              marginVertical: 5,
              marginHorizontal: 8,
              backgroundColor: 'white',
              borderColor: '#ddd',
              borderWidth: 0.5,
              elevation: 2,
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'row',
            }}>
            <View
              style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
              <Text style={{fontWeight: '500'}}>Roll No. {item.rollno}</Text>
              <Text style={{marginTop: 5}}>Name: {item.name}</Text>
              <Text style={{marginTop: 5, marginBottom: 10}}>
                Contact: {item.contact}
              </Text>

              {item.library_id && (
                <Barcode
                  height={60}
                  value={item.library_id}
                  format="CODE128"
                  width={5}
                  text={`Library ID: ${item.library_id}`}
                />
              )}
            </View>
            <View
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                disabled={item.contact ? false : true}
                onPress={() => Linking.openURL(`tel:+91${item.contact}`)}
                style={{
                  backgroundColor: getColor.primary,
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 12,
                  borderColor: 'white',
                  borderWidth: 2,
                }}>
                <MaterialIcon name="phone" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        );
      });
    } else {
      return (
        <View>
          <Text
            style={{textAlign: 'center', marginTop: 250, fontWeight: '500'}}>
            Please Select Any Course
          </Text>
        </View>
      );
    }
  };
  const renderCourse = () => {
    if (course.length) {
      return course.map(item => (
        <Picker.Item label={item.name} key={item.id} value={item.id} />
      ));
    }
  };

  return (
    <View style={{backgroundColor: '#fff', height: '100%'}}>
      <Text
        style={{
          color: 'black',
          fontSize: 12,
          marginTop: 5,
          marginHorizontal: 10,
        }}>
        Select Course
      </Text>
      <View style={{...TextInputStyle, padding: 0, height: 44}}>
        <Picker
          mode="dropdown"
          style={{marginTop: -5}}
          selectedValue={selectCourse}
          onValueChange={value => setSelectCourse(value)}>
          <Picker.Item label="-" value={null || ''} />
          {renderCourse()}
        </Picker>
      </View>

      <ScrollView style={{marginTop: 10}}>
        {data.length ? (
          <Text
            style={{textAlign: 'center', fontWeight: '600', marginBottom: 5}}>
            TOTAL STUDENT: {data.length}
          </Text>
        ) : (
          ''
        )}

        {renderData()}
      </ScrollView>
    </View>
  );
};
const mapStateToProps = state => {
  return {course: state.course};
};
export default connect(mapStateToProps, {logout})(UserList);

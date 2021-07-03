import React, { useState, useEffect } from "react";
import Toast from 'react-native-toast-message';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import {
  Layout,
  Divider,
  Text,
  CheckBox,
  IndexPath,
  Select,
  SelectItem,
  Button,
  Calendar,
  Input,
} from "@ui-kitten/components";
import Ionicons from "@expo/vector-icons/Ionicons";
import useSubstatus from '../../../../hooks/useSubstatus'
import useLead from '../../../../hooks/useLead'
import useAuth from '../../../../hooks/useAuth'
import useComment from '../../../../hooks/useComment'
import _ from 'lodash'
import moment from "moment";

const contactedStatus = [
  "605cbaafd5fc4809e161c526", // 'rejected', 
  "605bd712bed49524ae40f887", // 'visited', 
  "605bce8ba04514212f1fac67", // 'confirmed', 
  "605bd6b0bed49524ae40f885", // 'confirm', 
  "605bd6c4bed49524ae40f886", // 'visit_tracking', 
  "605bd717bed49524ae40f888", // 'reschedule', 
  "605bd729bed49524ae40f889", // 'client_na', 
  "605ce990c053b6162cf1c2ac", // 'documentation', 
  "605bd5e1bed49524ae40f883", // 'followup', 
  "605d10cf448ecc1d69de49aa", // 'sold', 
  "606e22fcc00bcb15b5e70822", // 'application', 
  "606e2319c00bcb15b5e70823", // 'approved_application', 
  "606e233bc00bcb15b5e70824", // 'conditioned_application', 
  "606e2367c00bcb15b5e70825", // 'rejected_application', 
  "606e2394c00bcb15b5e70826", // 'separated'
]

const AddTask = ({ navigation }) => {
  const [selectedSubstatus, setSelectedSubstatus] = useState(new IndexPath(0));

  const [date, setDate] = React.useState(new Date());
  const { substatuses, getSubstatuses } = useSubstatus();
  const { createComment, updateComment } = useComment();
  const { user } = useAuth();
  const { lead, updateLead, getLead } = useLead()
  const  [substatusArray, setSubstatusArray] = useState([])
  const  [substatusArrayIds, setSubstatusArrayIds] = useState([])
  const  [selectedActions, setSelectedActions] = useState([])
  const displayValue = substatusArray[selectedSubstatus.row];
  const currentId = substatusArrayIds[selectedSubstatus.row];
  const [text, setText] = useState('')

  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);


  const handleSubmit = async() => {
            
    if(text === ''){
      return Toast.show({
        text1: "Please leave a comment",
        type: "error",
        position: "bottom"
      });
    }else if(selectedActions.length === 0){
      return Toast.show({
        text1: "Select at least one action",
        type: "error",
        position: "bottom"
      });
    }else if(selectedActions.length > 3){
      return Toast.show({
        text1: "Select max 3 actions",
        type: "error",
        position: "bottom"
      });
    }else{
      let bodyLead = {
        substatus: currentId
      }

      let userId = '';
      let author = '';

      if(user && user.role && (user.role === 'rockstar' || user.role === 'admin' || user.role === 'super admin') && lead.agent && lead.agent._id){
          userId = lead.agent._id;
          author = user._id;
      }

      if(user && user.role && user.role === 'user'){
        userId = user._id;
      }

      let BodyComment = {
        comment: text,
        user: userId,
        action: selectedActions,
        reschedule: moment(date).format()
      }

      if(author !== ''){
        BodyComment.assignedBy = author;
      }

      if(userId === ''){
        //error poner agente
      }else{
        BodyComment.store = lead.store._id;

        if(contactedStatus.includes(currentId)){
          bodyLead.isContacted = true;
        }

        if(!lead.firstTask){
          bodyLead.firstTask = new Date();
        }

        if(lead.comments && lead.comments[0]){
          //Actualizar ultimo comment
          await updateComment({ pending: false}, lead.comments[0]._id);
        }

        await createComment(BodyComment, lead._id)
        await updateLead(bodyLead, lead._id);
        await getLead(lead._id)
        navigation.navigate("LeadTabs")
      }

    }
  }

  const handleSetAction = (item) => {
    if(selectedActions.includes(item)){
      let indexA = _.findIndex(selectedActions, function(o) { return o === item; });
      let aux = _.filter(selectedActions, (el, index) => { return index !== indexA; });
      setSelectedActions(aux)

    }else{
      setSelectedActions([...selectedActions, item])
    }
  }
  
  const actions = [
    { value: 'whatsapp', icon: <Ionicons name="logo-whatsapp" size={20} />},
    { value: 'recall', icon: <Ionicons name="call-outline" size={20} />},
    { value: 'documentation', icon: <Ionicons name="document-outline" size={20} />}
  ]

  useEffect(()=>{
    getSubstatuses()
    //eslint-disable-next-line
  },[])

  useEffect(()=>{
    if(substatuses){
      let aux = [];
      let auxIds = [];
      substatuses.map((item) =>{ 
        if(item.status === lead.status._id && item.name !== 'new' && item.name !== 'rejected' && item.name !== 'visit_rejected'){
          aux.push(item.name)
          auxIds.push(item._id)
        }
        return false;
      })
      setSubstatusArray(aux)
      setSubstatusArrayIds(auxIds)
    }
    //eslint-disable-next-line
  },[substatuses, lead])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView>
        <Layout
          style={{
            flex: 1,
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}
        >
          <Text style={styles.text} category="h3">
            Add Task
          </Text>

          <Divider style={{ marginBottom: 25 }} />

          <Layout style={{ marginBottom: 30 }}>
            <Text
              style={styles.text}
              category="s1"
              style={{ marginBottom: 20 }}
            >
              1. Leave a comment
            </Text>
            <Layout
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              <Input
                multiline={true}
                placeholder="Multiline"
                textStyle={{ minHeight: 64 }}
                style={{ minWidth: 400 }}
                value={text}
                onChangeText={(string)=>{setText(string)}}
              />
            </Layout>
          </Layout>
          <Layout style={{ marginBottom: 30 }}>
            <Text
              style={styles.text}
              category="s1"
              style={{ marginBottom: 20 }}
            >
              2. Choose an action
            </Text>
            <Layout
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-around",
              }}
            >
              {
                actions.map(item => (
                  <CheckBox key={item.value} status="primary" onChange={()=>handleSetAction(item.value)} checked={selectedActions.includes(item.value)}>
                    {" "}
                    { item.icon }
                  </CheckBox>
                ))
              }
            </Layout>
          </Layout>

          <Layout>
            <Text
              style={styles.text}
              category="s1"
              style={{ marginBottom: 20 }}
            >
              3. Choose status
            </Text>
            <Layout
              level="1"
              style={{
                minHeight: 128,
              }}
            >
              <Select
                size="large"
                style={{ marginBottom: 10 }}
                value={ lead && lead.status && lead.status.name }
              >
                <SelectItem title={lead && lead.status && lead.status.name} />
              </Select>
              <Select
                size="large"
                selectedIndex={selectedSubstatus}
                onSelect={(index) => {
                  setSelectedSubstatus(index)
                }}
                value={displayValue}
              >
                {
                  substatusArray.map(substatus => <SelectItem key={substatus} title={substatus} />)
                }
              </Select>
            </Layout>
          </Layout>
          <Layout>
            <Text
              style={styles.text}
              category="s1"
              style={{ marginBottom: 20 }}
            >
              4. Pick up Date
            </Text>
            <Layout
              level="1"
              style={{
                minHeight: 128,
              }}
            >
              <Calendar
                min={yesterday}
                date={date}
                onSelect={(nextDate) => setDate(nextDate)}
              />

            </Layout>
          </Layout>
          <Layout>
          <Button
          style={styles.button}
          onPress={handleSubmit}>
          Create Task
          </Button>
          </Layout>
        </Layout>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    margin: 2,
  },
  button: {
    marginTop: 20
  }
});

export default AddTask;
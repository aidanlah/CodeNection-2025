import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { auth, db } from "@/firebase.config";
// import { doc, updateDoc } from "firebase/firestore";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function EmergencyContactsPage() {
  // This would be configured in your navigation stack/tabs
  // Example for Stack Navigator:
  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     title: 'Emergency Contacts',
  //     headerRight: () => (
  //       <TouchableOpacity onPress={handleAddContact} style={{ marginRight: 15 }}>
  //         <Ionicons name="add" size={24} color="#16a34a" />
  //       </TouchableOpacity>
  //     ),
  //   });
  // }, [navigation]);

  // Mock emergency contacts - replace with Firebase data
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: "John Doe Fleming",
      phone: "+60123456789",
      relationship: "Father"
    },
    {
      id: '2',
      name: "Jane Smith",
      phone: "+60198765432", 
      relationship: "Mother"
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  // Handle back navigation
  const handleGoBack = () => {
    console.log("Navigate back to profile page");
    // router.back(); or navigation.goBack();
  };

  // Check if form has been modified
  const isFormModified = () => {
    if (editingContact) {
      return (
        formData.name !== editingContact.name ||
        formData.phone !== editingContact.phone ||
        formData.relationship !== editingContact.relationship
      );
    } else {
      return formData.name.trim() !== '' || formData.phone.trim() !== '' || formData.relationship.trim() !== '';
    }
  };

  // Handle modal close with confirmation
  const handleCloseModal = () => {
    if (isFormModified()) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          {
            text: "Keep Editing",
            style: "cancel"
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setModalVisible(false);
              setFormData({ name: '', phone: '', relationship: '' });
              setEditingContact(null);
            }
          }
        ]
      );
    } else {
      setModalVisible(false);
      setFormData({ name: '', phone: '', relationship: '' });
      setEditingContact(null);
    }
  };

  // Open modal for adding new contact
  const handleAddContact = () => {
    setEditingContact(null);
    setFormData({ name: '', phone: '', relationship: '' });
    setModalVisible(true);
  };

  // Open modal for editing existing contact
  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship
    });
    setModalVisible(true);
  };

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [contactToDelete, setContactToDelete] = useState<EmergencyContact | null>(null);

  // Delete contact with confirmation
  const handleDeleteContact = (contact: EmergencyContact): void => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${contact.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setContacts(prev => prev.filter(c => c.id !== contact.id));
            Alert.alert("Success", `${contact.name} has been deleted`);
            // Here you would also delete from Firebase
            // deleteContactFromFirebase(contact.id);
          }
        }
      ]
    );
  };

  // Save contact (add or edit)
  const handleSaveContact = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }
    if (!formData.relationship.trim()) {
      Alert.alert("Error", "Please enter a relationship");
      return;
    }

    try {
      if (editingContact) {
        // Update existing contact
        setContacts(prev => 
          prev.map(contact => 
            contact.id === editingContact.id 
              ? { ...contact, ...formData }
              : contact
          )
        );
      } else {
        // Add new contact
        const newContact: EmergencyContact = {
          id: Date.now().toString(), // Simple ID generation
          ...formData
        };
        setContacts(prev => [...prev, newContact]);
      }

      // Here you would save to Firebase
      // await saveContactsToFirebase(contacts);

      setModalVisible(false);
      setFormData({ name: '', phone: '', relationship: '' });
      setEditingContact(null);
      Alert.alert(
        "Success", 
        editingContact ? "Contact updated successfully!" : "Contact added successfully!"
      );

    } catch (error) {
      Alert.alert("Error", "Failed to save contact. Please try again.");
    }
  };

  // Relationship options for quick selection
  const relationshipOptions = ["Father", "Mother", "Sibling", "Friend", "Guardian", "Other"];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Contacts List */}
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <View key={contact.id} className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <Ionicons name="person" size={20} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-base">
                      {contact.name}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {contact.relationship}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {contact.phone}
                    </Text>
                  </View>
                </View>
                
                {/* Action Buttons */}
                <View className="flex-row">
                  <TouchableOpacity 
                    onPress={() => handleEditContact(contact)}
                    className="p-2 mr-2"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={18} color="#16a34a" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteContact(contact)}
                    className="p-2"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-lg p-8 shadow-sm items-center">
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4 mb-2">
              No Emergency Contacts
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              Add your emergency contacts to help others reach your loved ones if needed
            </Text>
            <TouchableOpacity 
              onPress={handleAddContact}
              className="px-6 py-2 rounded-lg"
              style={{backgroundColor: '#16a34a'}}
              activeOpacity={0.8}
            >
              <Text className="text-white font-medium">Add First Contact</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Contact Button - Safer Position */}
      {contacts.length > 0 && (
        <View className="px-4 pb-6">
          <TouchableOpacity
            onPress={handleAddContact}
            className="flex-row items-center justify-center py-3 px-6 rounded-lg border-2 border-dashed"
            style={{borderColor: '#16a34a'}}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color="#16a34a" style={{marginRight: 8}} />
            <Text style={{color: '#16a34a'}} className="font-semibold">
              Add Another Contact
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add/Edit Contact Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          {/* Modal Header */}
          <View className="px-4 py-6 relative" style={{backgroundColor: '#16a34a'}}>
            <TouchableOpacity 
              onPress={handleCloseModal}
              className="absolute top-6 left-4 z-10"
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-center text-white">
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <TouchableOpacity 
              onPress={handleSaveContact}
              className="absolute top-6 right-4 z-10"
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            {/* Name Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Full Name *</Text>
              <TextInput
                className="bg-white rounded-lg px-4 py-3 border border-gray-200"
                placeholder="Enter full name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
                autoCapitalize="words"
              />
            </View>

            {/* Phone Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Phone Number *</Text>
              <TextInput
                className="bg-white rounded-lg px-4 py-3 border border-gray-200"
                placeholder="+60123456789"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({...prev, phone: text}))}
                keyboardType="phone-pad"
              />
            </View>

            {/* Relationship Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">Relationship *</Text>
              <TextInput
                className="bg-white rounded-lg px-4 py-3 border border-gray-200"
                placeholder="e.g. Father, Mother, Friend"
                value={formData.relationship}
                onChangeText={(text) => setFormData(prev => ({...prev, relationship: text}))}
                autoCapitalize="words"
              />
              
              {/* Quick Select Buttons */}
              <Text className="text-gray-500 text-sm mt-2 mb-2">Quick select:</Text>
              <View className="flex-row flex-wrap">
                {relationshipOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setFormData(prev => ({...prev, relationship: option}))}
                    className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700 text-sm">{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}